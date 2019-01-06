// 'use strict';

// //Application Dependencies
// const express = require('express');
// const pg = require('pg');
// const cors = require('cors');
// const superAgent = require('superagent');

// // Calling Date.now() returns the time in milliseconds since Jan 1 1970 00:00:00 UTC
// // Multiplying an amount of milliseconds by 1000 achieves 1 second in computer time
// // we will have a 15 second cache invalidation
// // Darksky api has a request limit of 1000 hits a day
// const timeouts = {
//   weather: 15 * 1000, //15 seconds
//   meetups: 60 * 60 * 24 * 1000 // 24 hours
// }

// //Load env vars;
// require('dotenv').config();

// const PORT = process.env.PORT || 3000;
// //postgress setup
// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', err => console.error(err));
// //app
// const app = express();
// app.use(cors());
// app.get('/location', getLocation);
// // Get weather data
// app.get('/weather', (request, response) => {
//   searchWeather(request.query.data /*|| 'Lynnwood, WA'*/)
//     .then(weatherData => {
//       response.send(weatherData);
//     })
//     .catch(err => {
//       console.log('========== error from weather ===========')
//       console.error(err);
//     })
//   // console.log(weatherGet);
// });
// // app.get('/movies', getMov);
// // app.get('/yelp', getYelp);
// //======================================================================================================
// // Get Location data
// // help from erin and skyler
// function getLocation(request, response){
//   let searchHandler = {
//     cacheHit: (data) => {
//       console.log('from teh dataBass');
//       // console.log('getLocation Server data :', data)
//       response.status(200).send(data);
//     },
//     cacheMiss: (query) => {
//       return searchLocation(query)
//         .then(result => {
//           // console.log('getLocation Server data :', result)
//           response.send(result);
//         }).catch(err=>console.error(err));
//     }
//   }
//   lookForLocation(request.query.data, searchHandler);
// }

// function lookForLocation (query, handler) {
//   const SQL = 'SELECT * FROM locations WHERE search_query=$1';
//   const values = [query];
//   return client.query(SQL, values)
//     .then(data => {
//       if(data.rowCount){
//         console.log('from teh dataBass');
//         handler.cacheHit(data.rows[0]);
//       }else {
//         handler.cacheMiss(query);
//       }
//     }).catch(err => console.error(err));
// }

// function searchLocation (query){
//   const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

//   return superAgent.get(URL)
//     .then(result => {
//       console.log('from teh googs');
//       let location = new Location(result.body.results[0]);
//       let SQL = `INSERT INTO locations
//         (search_query, formatted_query, latitude, longitude)
//         VALUES($1, $2, $3, $4)
//         RETURNING id`;

//       return client.query(SQL, [query, location.formatted_query, location.latitude, location.longitude])
//         .then((result) => {
//           console.log(result);
//           console.log('stored to DB');
//           location.id = result.rows[0].id
//           return location;//5ends with a sucseful storage
//         }).catch(err => console.error(err));
//     });
// }

// function Location(location, query){
//   this. search_query = query;
//   this.formatted_query = location.formatted_address;
//   this.latitude = location.geometry.location.lat;
//   this.longitude = location.geometry.location.lng;
// }
// //==================================================================================================================
// function searchWeather(query){
//   const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
//   // body.results.geometry.location. lat || lng
//   // console.log(url);
//   const SQL = 'SELECT * FROM weathers WHERE location_id=$1'
//   return client.query(SQL, [query.id])
//     .then(result => {
//       if(!result.rowCount){
//         console.log('gonna go get stuff from the weather api');
//         return superAgent.get(url)
//           .then(weatherData => {
//             let wArr = weatherData.body.daily.data.map(
//               forecast => {
//                 let data = {};
//                 data.forecast = forecast.summary;
//                 data.time = new Date(forecast.time * 1000).toDateString();
//                 return data;
//               }
//             );
//             // ==================
//             //put weather data in the db
//             // =====================
//             wArr.forEach(forecast => {
//               //insert the forecast into DB
//               console.log('storing a forecast');
//               const SQL = 'INSERT INTO weathers (forecast, time, created_at, location_id) VALUES($1, $2, $3, $4)';
//               const values = [forecast.forecast, forecast.time, Date.now(), query.id]
//               client.query(SQL, values)
//                 .catch(err => {
//                   console.log('========== error from weather ===========')
//                   console.error(err);
//                 });
//             })

//             return wArr;
//           })
//           .catch(err => {
//             console.log('========== error from weather ===========', err)
//           })
//       } else {
//         console.log('found stuff in the db for weather');
//         if (Date.now() - result.rows[0].created_at > timeouts.weather ){

//           console.log('data too old, invalidating');
//           const SQL = 'DELETE FROM weathers WHERE location_id=$1'
//           const values=[query.id];

//           return client.query(SQL, values)
//             .then(() => {
//               return superAgent.get(url)
//                 .then(weatherData => {
//                   let wArr = weatherData.body.daily.data.map(
//                     forecast => {
//                       let data = {};
//                       data.forecast = forecast.summary;
//                       data.time = new Date(forecast.time * 1000).toDateString();
//                       return data;
//                     }
//                   );
//                   // ==================
//                   //put weather data in the db
//                   // =====================
//                   wArr.forEach(forecast => {
//                     //insert the forecast into DB
//                     console.log('storing a forecast');
//                     const SQL = 'INSERT INTO weathers (forecast, time, created_at, location_id) VALUES($1, $2, $3, $4)';
//                     const values = [forecast.forecast, forecast.time, Date.now(), query.id]
//                     client.query(SQL, values)
//                       .catch(err => {
//                         console.log('========== error from weather ===========')
//                         console.error(err);
//                       });
//                   })
//                   return wArr;
//                 })
//             })


//         }
//         return result.rows;
//       }
//     })

//   // how to pull lat/long from google API, then format so we can input it into this URL

//     .catch(err => {
//       console.log('========== error from weather ===========')
//       console.error(err)
//     });
// }

// // Error messages
// app.get('/*', function(req, res) {
//   res.status(404).send('halp, you are in the wrong place');
// });

// function errorMessage(res, path){
//   res.status(500).send('something went wrong. plzfix.');
// } //created a function to handle the 500 errors but not sure what to do with it

// app.listen(PORT, () => {
//   console.log(`app is up on port : ${PORT}`);
// });













'use strict';

//Application Dependencies
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superAgent = require('superagent');

//Load env vars;
require('dotenv').config();

const PORT = process.env.PORT;
//postgress setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));
//app
const app = express();
app.use(cors());
app.get('/location', getLocation);
// Get weather data
app.get('/weather', (request, response) => {
  searchWeather(request.query.data /*|| 'Lynnwood, WA'*/)
    .then(weatherData => {
      response.send(weatherData);
    });
  // console.log(weatherGet);
});
app.get('/movies', getMov);
app.get('/yelp', getYelp);
app.get('/meetups', getMeets);
app.get('/trail', getTrails);
// Get Location data
// help from erin and skyler
function getLocation(request, response){
  let searchHandler = {
    cacheHit: (data) => {
      console.log('from teh dataBass');
      // console.log('getLocation Server data :', data)
      response.status(200).send(data);
    },
    cacheMiss: (query) => {
      return searchLocation(query)
        .then(result => {
          // console.log('getLocation Server data :', result)
          response.send(result);
        }).catch(err=>console.error(err));
    }
  }
  lookForLocation(request.query.data, searchHandler);
}

function lookForLocation (query, handler) {
  const SQL = 'SELECT * FROM locations WHERE search_query=$1';
  const values = [query];
  return client.query(SQL, values)
    .then(data => {
      if(data.rowCount){
        console.log('from teh dataBass');
        handler.cacheHit(data.rows[0]);
      }else {
        handler.cacheMiss(query);
      }
    }).catch(err => console.error(err));
}

function searchLocation (query){
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superAgent.get(URL)
    .then(result => {
      console.log('from teh googs');
      let location = new Location(result.body.results[0]);
      let SQL = `INSERT INTO locations 
        (search_query, formatted_query, latitude, longitude)
        VALUES($1, $2, $3, $4)
        RETURNING id`;

      return client.query(SQL, [query, location.formatted_query, location.latitude, location.longitude])
        .then(() => {
          console.log('stored to DB');
          return location;//sends with a sucseful storage
        }).catch(err => console.error(err));
    });
}

function Location(location, query){
  this. search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}


//movies-----------------------------

//mov func
function getMov (request, response) {
  return searchMovs(request.query.data)
    .then(movData => {
      response.send(movData);}
    );
}

function searchMovs(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${query}`;
  return superAgent.get(url)
    .then(moviesData => {
      // console.log(query);
      return moviesData.body.results.map(movie => new Movie(movie));
    });
}
function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  if (movie.poster_path) {
    this.image_url = `http://image.tmdb.org/t/p/w200_and_h300_bestv2${movie.poster_path}`;
  } else {
    this.image_url = null;
  }
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}
//yelp-----------------------------------------------------------------------------------------------


function getYelp (request, response){
  return searchYelps(request.query.data)
    .then(yelpData => {
      response.send(yelpData);}
    );
}
function searchYelps(query) {
  const url = `https://api.yelp.com/v3/businesses/search?term=delis&latitude=${query.latitude}&longitude=${query.longitude}`;
  return superAgent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(yelpData => {
      // console.log(yelpData.body.businesses);
      return yelpData.body.businesses.map(bsns => new Bsns(bsns));
    })
    .catch(err => console.error(err));
}
function Bsns (bsns){
  this.name = bsns.name;
  this.image_url = bsns.image_url;
  this.price = bsns.price;
  this.ratin5g = bsns.rating;
  this.url = bsns.url;
}


//yelp API you will have to use a .set inside, in the query function....

function searchWeather(query){
  // console.log(query);
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
  // body.results.geometry.location. lat || lng
  // console.log(url);
  const SQL = 'SELECT * FROM weathers WHERE location_id=$1'
  return client.query(SQL, [query.id])
    .then(result => {
      if(!result.rowCount){
        console.log('gonna go get stuff from the weather api');
        return superAgent.get(url)
          .then(weatherData => {
            let wArr = weatherData.body.daily.data.map(
              forecast => {
                let data = {};
                data.forecast = forecast.summary;
                data.time = new Date(forecast.time * 1000).toDateString();
                return data;
              }
            );
            // ==================
            //put weather data in the db
            // =====================
            wArr.forEach(forecast => {
              //insert the forecast into DB
              console.log('storing a forecast');
              const SQL = 'INSERT INTO weathers (forecast, time, location_id) VALUES($1, $2, $3)';
              const values = [forecast.forecast, forecast.time, query.id]
              client.query(SQL, values);
            })

            return wArr;
          })
      } else {
        console.log('found stuff in the db for weather');
        // console.log(result.rows);
        return result.rows;
      }
    })

  // how to pull lat/long from google API, then format so we can input it into this URL

    .catch(err => console.error(err));
}
//=====================================================================================================
function getMeets(request, response){
  searchMeets(request.query.data)
    .then(data => {
      response.send(data);
    }).catch(err => console.error(err));
}
function searchMeets(query){
  const URL =`https://api.meetup.com/find/groups?category=20&key=${process.env.MEET_API_KEY}&lat=${query.latitude}&long=${query.longitude}`;
  const SQL = 'SELECT * FROM meetups WHERE location_id=$1';
  return client.query(SQL, [query.id])
    .then(result => {
      if(!result.rowCount){
        console.log('gonna go get stuff from the meetup api');
        return superAgent.get(URL)
          .then(data => {
            // console.log(data.body);
            let mArr = data.body.map(ele => {
              return new Meetup(ele);
            });
              // client.query(SQL, [meetup.link, meetup.name, meetup.creation_date, meetup.host, Date.now(), query.id])
              //   .then(() => {
              //     console.log('stored to DB');
              //   //sends with a sucseful storage
              //   }
            let SQL = `INSERT INTO meetups
                      VALUES($1, $2, $3, $4, $5, $6)`;
            mArr.forEach(meetup => {
              client.query(SQL, [meetup.link, meetup.name, meetup.creation_date, meetup.host, query.id, Date.now()])
            });
            return mArr;
          }).catch(err => console.error(err));

      }
      // else {
      //   // console.log('found stuff in the db for meetups');
      //   console.log(result.rows);
      //   return result.rows;
      // }
    }).catch(err => console.error(err));

}

function Meetup(data){
  this.link = data.link;
  this.name = data.name;
  this.creation_date = new Date(data.created * 1000).toDateString();
  this.host = data.organizer.name;
}
//=======================================================================================================
function getTrails(request, response){
  checkTrails(request.query.data)
    .then(data => {
      response.send(data);
    }).catch(err => console.log(err));
}
function checkTrails(query){
  let SQL = 'SELECT * FROM hiking WHERE location_id=$1';
  return client.query(SQL, [query.id]).then(data => {
    if(!data.rowCount){
      const URL = `https://www.hikingproject.com/data/get-trails?lat=${query.lat}&lon=${query.long}&maxDistance=10&key=${process.env.HIKE_API_KEY}`;
      return superAgent.get(URL)
        .then(result => {
          let trailData = JSON.parse(result.text);

          let trailArray = trailData.trails.map(trail => {
            return new Trail(trail);
          });
          let SQL = `INSERT INTO hiking
              (name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time, location_id, created_at)
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

          trailArray.map(trail => {
            client.query(SQL, [trail.name, trail.location, trail.length, trail.stars, trail.star_votes, trail.summary, trail.trail_url, trail. conditions, trail.condition_date, trail.condition_time, query.id, Date.now()])
          });
          return trailArray;
        });
    }else {
      let arr = data.rows[0];
      return arr;
    }
  })
    .catch(err => console.log(err));
}
function Trail (trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionDetails;

  let condition = trail.conditionDate.split(' ');
  this.condition_date = condition[0];
  this.condition_time = condition[1];
}
// function Trail(data){
//   this.name = data.name;
//   this.location = data.location;
//   this.length = data.length;
//   this.stars = data.stars;
//   this.star_votes = data.starVotes;
//   this.summary = data.summary;
//   this.trail_url = data.url;
//   this.conditions = data.conditionStatus;
//   let conditionDateTime = data.conditionDate.split(' ');
//   this.condition_date = conditionDateTime[0];
//   this.condition_time = conditionDateTime[1];
// }
//=======================================================================================================
// Error messages
app.get('/*', function(req, res) {
  res.status(404).send('halp, you are in the wrong place');
});
app.listen(PORT, () => {
  console.log(`app is up on port : ${PORT}`);
});
