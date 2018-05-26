import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      config.withBaseUrl('http://localhost:3000/api')
      // config.withBaseUrl('https://letsziggy-freecodecamp-dynamic-web-application-05.glitch.me/api')
            .withInterceptor({
              request(request) {
                return request;
              },
              requestError(requestError) {
                console.log(requestError);
                return requestError;
              },
              response(response) {
                return response;
              },
              responseError(responseError) {
                console.log(responseError);
                return responseError;
              }
      });
    });
    this.http = HttpClient;
  }

  getPins() {
    return(
      this.http.fetch(`/pins/get`, {
                 method: 'GET',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               .then(data => data.taken)
    );
  }

  likePin(pin, username) {
    // return(
    //   this.http.fetch(`/pins/like`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ pin: pin, username: username })
    //            })
    //            .then(response => response.json())
    //            .then(data => data.taken)
    // );
    return({ like: true });
  }

  deletePin(pin, username) {
    // return(
    //   this.http.fetch(`/pins/delete`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ pin: pin, username: username })
    //            })
    //            .then(response => response.json())
    //            .then(data => data.taken)
    // );
    return({ delete: true });
  }

  addPin(pin, username) {
    return(
      this.http.fetch(`/pins/add`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ pin: pin, username: username })
               })
               .then(response => response.json())
               .then(data => data.taken)
    );
  }

  getUserNames(username) {
    return(
      this.http.fetch(`/user/checkname`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ username: username })
               })
               .then(response => response.json())
               .then(data => data.taken)
    );
  }

  createUser(user) {
    return(
      this.http.fetch(`/user/create`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(user)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  getUser(user) {
    // return(
    //   this.http.fetch(`/user/login`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify(user)
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    let date = new Date();
    date.setDate(date.getDate() + 1);
    return({ get: true, expire: date.getTime() });
  }

  logoutUser() {
    // return(
    //   this.http.fetch(`/user/logout`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json'
    //              }
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ logout: true });
  }

  editUser(user) {
    return(
      this.http.fetch(`/user/edit`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(user)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }
}