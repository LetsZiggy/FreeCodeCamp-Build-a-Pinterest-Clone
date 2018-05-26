import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      // config.withBaseUrl('http://localhost:3000/api')
      config.withBaseUrl('https://letsziggy-freecodecamp-dynamic-web-application-05.glitch.me/api')
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
               .then(data => data)
    );
  }

  likePin(pin, username, wsID) {
    return(
      this.http.fetch(`/pins/like`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ pin: pin, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  unlikePin(pin, username, wsID) {
    return(
      this.http.fetch(`/pins/unlike`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ pin: pin, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  deletePin(pin, username, wsID) {
    return(
      this.http.fetch(`/pins/delete`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ pin: pin, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  addPin(pin, username, wsID) {
    return(
      this.http.fetch(`/pins/add`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ pin: pin, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
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
    return(
      this.http.fetch(`/user/login`, {
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

  logoutUser() {
    return(
      this.http.fetch(`/user/logout`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               .then(data => data)
    );
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