
// const resolvePaths = (
//     sourceAirport: Airport,
//     destinationAirport: Airport
//   ) => {
//     // get original distance
//     const originalDistance = haversine(
//       sourceAirport.location.latitude,
//       sourceAirport.location.longitude,
//       destinationAirport.location.latitude,
//       destinationAirport.location.longitude
//     );

//     let sourceRoutes = routes.filter(
//       (r) => r.source.iata === sourceAirport.iata
//     );

//     // const result = sourceRoutes.map((value) => {
//     //   let distance = haversine(
//     //     value.source.location.latitude,
//     //     value.source.location.longitude,
//     //     value.destination.location.latitude,
//     //     value.destination.location.longitude
//     //   );

//     //   return {};
//     // });
//     // if (
//     //   sourceRoutes
//     //     .map((r) => r.destination)
//     //     .some((v) => v.iata === destinationAirport.iata)
//     // ) {
//     //   // there is a direct fly!
//     //   return {
//     //     distance: originalDistance,
//     //     hops: [sourceAirport.iata, destinationAirport.iata],
//     //   };
//     // } else {
//     //   // only airports with shorter distance
//     //   sourceRoutes = sourceRoutes.filter((d) =>
//     //     isRightRoute(d, destinationAirport, originalDistance)
//     //   );
//     // }

//     // const results = [];

//     // // if no direct fly check from oposite side
//     // const destinationAvalibleDestinations = routes
//     //   .filter((r) => r.source.iata === destinationAirport.iata)
//     //   .filter((r) =>
//     //     isRightRoute(r, sourceAirport, originalDistance)
//     //   )
//     //   .map((r) => r.destination);

//     // const filteredArray = destinationAvalibleDestinations.filter((element) =>
//     //   sourceRoutes.map((r) => r.destination).includes(element)
//     // );

//     // const intersection = sourceRoutes
//     //   .map((r) => r.destination)
//     //   .filter((element) => destinationAvalibleDestinations.includes(element));
//   };





    // const { distance, hops } = resolvePaths(sourceAirport, destinationAirport);

    // const originalDistance = haversine(
    //   sourceAirport.location.latitude,
    //   sourceAirport.location.longitude,
    //   destinationAirport.location.latitude,
    //   destinationAirport.location.longitude
    // );

    // const sourceRoutes = routes.filter(
    //   (r) => r.source.iata === sourceAirport.iata
    // );
    // const smth = sourceRoutes.map((r) => r.destination);

    // if (smth.some((v) => v.iata === destinationAirport.iata)) {
    //   console.log("there is a direct fly!");
    //   return {
    //     source,
    //     destination,
    //     distance: originalDistance,
    //     hops: [sourceAirport.iata, destinationAirport.iata],
    //   };
    // }

    // const firstReasonableRoutes = [];
    // for (let i = 0; i < sourceRoutes.length; i++) {
    //   const isRight: boolean = isRightRoute(
    //     sourceRoutes[i],
    //     destinationAirport,
    //     originalDistance
    //   );

    //   // const result = [];
    //   // const sourceAvalibleAirport = sourceRoutes[i].destination;
    //   // const distanceToTarget = haversine(
    //   //   sourceAvalibleAirport.location.latitude,
    //   //   sourceAvalibleAirport.location.longitude,
    //   //   destinationAirport.location.latitude,
    //   //   destinationAirport.location.longitude
    //   // );
    //   // if (distanceToTarget > originalDistance) continue;
    //   // result.push();
    //   // const secondRoutes = routes.filter(
    //   //   (r) => r.source.iata === sourceRoutes[i].destination.iata
    //   // );

    //   // for (let s = 0; s < secondRoutes.length; s++) {
    //   //   const secondAvalibleAirport = secondRoutes[s].destination;
    //   //   const distanceToTarget = haversine(
    //   //     secondAvalibleAirport.location.latitude,
    //   //     secondAvalibleAirport.location.longitude,
    //   //     destinationAirport.location.latitude,
    //   //     destinationAirport.location.longitude
    //   //   );
    //   //   if (distanceToTarget > originalDistance) continue;
    //   // }
    //   // for (let i = 0; i < firstReasonableRoutes.length; i++) {
    //   //   for (let ii = 0; ii < array.length; ii++) {
    //   //     const element = array[ii];
    //   //   }
    //   //   const distanceToTarget = haversine(
    //   //     secondRoute.destination.location.latitude,
    //   //     secondRoute.destination.location.longitude,
    //   //     destinationAirport.location.latitude,
    //   //     destinationAirport.location.longitude
    //   //   );
    //   //   if (distanceToTarget + secondRoute > originalDistance) continue;
    //   // }
    //   // firstReasonableRoutes.push(sourceRoutes[i]);
    // }
    // console.log("first reasonable routes ", firstReasonableRoutes.length);

    // console.log(sourceAirport.icao, " avalibleAirports are", avalibleAirports);




// export function findShortestRoute(
//   origin: Airport,
//   destination: Airport
// ): {
//   hops: { from: string; to: string; distance: number }[];
//   distance: number;
// } {
//   // Placeholder implementation using a simple depth-first search
//   // Replace with a more efficient algorithm for larger datasets
//   const visited = new Set<Airport>();
//   let shortestRoute = { hops: [], distance: Infinity };

//   function dfs(
//     // currentRoute: { from: string; to: string; distance: number }[],
//     currentRoute: Route[],
//     currentDistance: number
//   ): void {
//     if (currentDistance >= shortestRoute.distance) {
//       return;
//     }

//     const currentAirport: Airport = currentRoute[currentRoute.length - 1].destination;
//     if (currentAirport === destination) {
//       shortestRoute = { hops: [...currentRoute], distance: currentDistance };
//       return;
//     }

//     visited.add(currentAirport);

//     const possibleNextAirports = routes.filter(
//       (r) => r.source.iata === currentAirport.iata
//     );
//     for (const nextAirport of possibleNextAirports) {
//       if (!visited.has(nextAirport)) {
//         const nextLeg = {
//           source: currentAirport,
//           destination: nextAirport,
//           distance: getDistance(currentAirport, nextAirport),
//         };
//         dfs([...currentRoute, nextLeg], currentDistance + nextLeg.distance);
//       }
//     }

//     visited.delete(currentAirport);
//   }

//   dfs([{ source: origin, destination: origin, distance: 0 }], 0);
//   return shortestRoute;
// }





// important 


// const destinationsByAirportCode = new Map<string, Route[]>(
//     flatten(
//       airports.map((airport) =>
//         [
//           airport.iata !== null
//             ? ([airport.iata.toLowerCase(), routes.filter(r=>r.source.iata === airport.iata)] as const)
//             : null,
//           airport.icao !== null
//             ? ([airport.icao.toLowerCase(), routes.filter(r=>r.source.icao === airport.icao)] as const)
//             : null,
//         ].filter(notNil)
//       )
//     )
//   );