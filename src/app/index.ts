import * as express from "express";
import * as morgan from "morgan";
import { notNil, flatten, isRightRoute, getDistance } from "../util";
import { Airport, Route, loadAirportData, loadRouteData } from "../data";

export async function createApp() {
  const app = express();
  const [airports, routes] = await Promise.all([
    loadAirportData(),
    loadRouteData(),
  ]);

  const airportsByCode = new Map<string, Airport>(
    flatten(
      airports.map((airport) =>
        [
          airport.iata !== null
            ? ([airport.iata.toLowerCase(), airport] as const)
            : null,
          airport.icao !== null
            ? ([airport.icao.toLowerCase(), airport] as const)
            : null,
        ].filter(notNil)
      )
    )
  );

  const destinationsByAirportCode = new Map<string, Route[]>(
    flatten(
      airports.map((airport) =>
        [
          airport.iata !== null
            ? ([
                airport.iata,
                routes.filter((r) => r.source.iata === airport.iata),
              ] as const)
            : null,
          airport.icao !== null
            ? ([
                airport.icao,
                routes.filter((r) => r.source.icao === airport.icao),
              ] as const)
            : null,
        ].filter(notNil)
      )
    )
  );

  function findShortestRoute(
    origin: Airport,
    destination: Airport,
    mixed: boolean
  ): {
    hops: string[];
    distance: number;
  } {
    // check for visited airports
    const visited = new Set<String>();
    // initial result object
    let shortestRoute = { hops: [], distance: Infinity };
    // distance taken to prevent moving away
    const straightDistance = getDistance(origin, destination) * 1.2;
    // routes which leads to destination are final
    const finalRoutes: Route[] = destinationsByAirportCode.get(
      destination.iata || destination.icao
    );

    // reccuring function to keep looking path to destination
    function dfs(currentRoute: Route[], currentDistance: number): void {
      // prevent if route is longer or too many stops
      if (
        currentDistance >= shortestRoute.distance ||
        currentRoute.length > 4
      ) {
        return;
      }

      const currentAirport: Airport =
        currentRoute[currentRoute.length - 1].destination;

      // check that we can go to destination
      if (finalRoutes.some((r) => r.destination.id === currentAirport.id)) {
        const lastRoute: Route = finalRoutes
          .filter((r) => r.destination.id === currentAirport.id)
          .sort((a, b) => a.distance - b.distance)[0];
        const sumDistance = currentDistance + lastRoute.distance;
        if (sumDistance < shortestRoute.distance) {
          shortestRoute = {
            hops: [
              ...currentRoute.map((r) => r.destination.iata),
              lastRoute.source.iata || lastRoute.source.icao,
            ],
            distance: sumDistance,
          };
        }
        return;
      }

      visited.add(currentAirport.iata || currentAirport.icao);

      // possible and reasonable destination airports
      const nextRoutes = destinationsByAirportCode
        .get(currentAirport.iata || currentAirport.icao)
        .filter((r) =>
          isRightRoute(r, destination, straightDistance - currentDistance)
        );

      for (const nextAirport of nextRoutes) {
        if (
          !visited.has(
            nextAirport.destination.iata || nextAirport.destination.icao
          )
        ) {
          const nextLeg = {
            source: currentAirport,
            destination: nextAirport.destination,
            distance: nextAirport.distance,
          };
          dfs([...currentRoute, nextLeg], currentDistance + nextLeg.distance);
        }
      }

      visited.delete(currentAirport.iata || currentAirport.icao);
    }

    dfs([{ source: origin, destination: origin, distance: 0 }], 0);
    return shortestRoute;
  }

  app.use(morgan("tiny"));

  app.get("/health", (_, res) => res.send("OK"));
  app.get("/airports/:code", (req, res) => {
    const code = req.params["code"];
    if (code === undefined) {
      return res.status(400).send("Must provide airport code");
    }

    const airport = airportsByCode.get(code.toLowerCase());
    if (airport === undefined) {
      return res
        .status(404)
        .send("No such airport, please provide a valid IATA/ICAO code");
    }

    return res.status(200).send(airport);
  });
  app.get("/routes/:source/:destination/:searchType?", (req, res) => {
    const mixedSearch: boolean = req.params["searchType"] === "mixed" || false;
    const source = req.params["source"];
    const destination = req.params["destination"];
    if (source === undefined || destination === undefined) {
      return res
        .status(400)
        .send("Must provide source and destination airports");
    }

    const sourceAirport = airportsByCode.get(source.toLowerCase());
    const destinationAirport = airportsByCode.get(destination.toLowerCase());
    if (sourceAirport === undefined || destinationAirport === undefined) {
      return res
        .status(404)
        .send("No such airport, please provide a valid IATA/ICAO codes");
    }

    const result = findShortestRoute(
      sourceAirport,
      destinationAirport,
      mixedSearch
    );

    return res.status(200).send({
      source,
      destination,
      distance: result.distance,
      hops: result.hops,
    });
  });

  return app;
}
