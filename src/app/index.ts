import * as express from "express";
import * as morgan from "morgan";

import { notNil, flatten, isRightRoute, getDistance, isRightRouteV2 } from "../util";
import { Airport, Route, loadAirportData, loadRouteData } from "../data";

export async function createApp() {
  const app = express();

  const airports = await loadAirportData();
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

  const routes = await loadRouteData();

  const destinationsByAirportCode = new Map<string, Route[]>(
    flatten(
      airports.map((airport) =>
        [
          airport.iata !== null
            ? ([airport.iata, routes.filter(r=>r.source.iata === airport.iata)] as const)
            : null,
          airport.icao !== null
            ? ([airport.icao, routes.filter(r=>r.source.icao === airport.icao)] as const)
            : null,
        ].filter(notNil)
      )
    )
  );

  function findShortestRoute(
    origin: Airport,
    destination: Airport
  ): {
    hops: string[];
    distance: number;
  } {
    // Placeholder implementation using a simple depth-first search
    // Replace with a more efficient algorithm for larger datasets
    // const visited = new Set<Airport>();
    const visited = new Set<String>();
    let shortestRoute = { hops: [], distance: Infinity };
    // const straightDistance = getDistance(origin, destination);
    function dfs(currentRoute: Route[], currentDistance: number): void {
      if (
        currentDistance >= shortestRoute.distance ||
        currentRoute.length > 5
      ) {
        return;
      }

      const currentAirport: Airport =
        currentRoute[currentRoute.length - 1].destination;

      if (currentAirport.id === destination.id) {
        shortestRoute = {
          hops: [...currentRoute.map((r) => r.destination.iata)],
          distance: currentDistance,
        };
        return;
      }

      visited.add(currentAirport.iata || currentAirport.icao);

      // possible and reasonable destination airports
      const nextRoutes =
        destinationsByAirportCode.get(currentAirport.iata || currentAirport.icao)
        // routes
        //   .filter(
        //     (r) => r.source.iata === currentAirport.iata
        //     // r.source.icao === currentAirport.icao
        //   )
          .filter(
            (r) =>
              isRightRouteV2(
                r,
                destination,
                // straightDistance - currentDistance
              )
            // isRightRoute(r, destination)
          );
      // .map((r) => r.destination);

      for (const nextAirport of nextRoutes) {
        if (!visited.has(nextAirport.destination.iata || nextAirport.destination.icao)) {
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

  app.get("/routes/:source/:destination", (req, res) => {
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



    const result = findShortestRoute(sourceAirport, destinationAirport);
    console.log(result.hops);

    return res.status(200).send({
      source,
      destination,
      distance: result.distance,
      hops: result.hops,
    });
  });

  return app;
}
