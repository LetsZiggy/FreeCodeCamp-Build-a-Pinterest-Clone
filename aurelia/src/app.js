import {inject, bindable, bindingMode} from 'aurelia-framework';
import {ApiInterface} from './resources/services/api-interface';
import {handleWebsocket} from './resources/services/handle-websocket';
import {state} from './resources/services/state';

@inject(ApiInterface)
export class App {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
  }

  bind() {
    let data = JSON.parse(localStorage.getItem('freecodecamp-build-a-pinterest-clone')) || {};

    if(data.username && data.userexpire && (parseInt(data.userexpire) - Date.now()) > 5000) {
      this.state.user.username = data.username || null;
      this.state.user.expire = parseInt(data.userexpire) || null;
    }
    else {
      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      localStorage.setItem('freecodecamp-build-a-pinterest-clone', JSON.stringify(data));
    }

    // if(!this.state.webSocket) {
    //   this.setWebsocket();
    // }
  }

  async attached() {
    if(this.state.user.username && this.state.user.expire && (this.state.user.expire - Date.now()) > 5000) {
      this.state.user.interval = setTimeout(async () => {
        let logout = await this.api.logoutUser();
        
        if(this.state.user.interval) {
          clearInterval(this.state.user.interval);
          this.state.user.interval = null;
        }

        if(this.state.webSocketID) {
          this.state.webSocket.send(JSON.stringify({ type: 'logout' }));
        }

        this.state.user.username = null;
        this.state.user.expire = null;
        console.log('logout');
      }, (this.state.user.expire - Date.now()));
    }
    else {
      let logout = await this.api.logoutUser();

      if(this.state.user.interval) {
        clearInterval(this.state.user.interval);
        this.state.user.interval = null;
      }

      this.state.user.username = null;
      this.state.user.expire = null;
    }

    window.onbeforeunload = (event) => {
      if(this.state.user.interval) {
        clearInterval(this.state.user.interval);
        this.state.user.interval = null;
      }

      if(this.state.toUpdate) {
        clearInterval(this.state.toUpdate);
        this.state.toUpdate = null;
      }

      if(this.state.webSocket) {
        this.state.webSocket.close();
        this.state.webSocketID = null;
        this.state.webSocket = null;
        console.log('close');
      }

      if(this.state.user.username) {
        let store = JSON.parse(localStorage.getItem('freecodecamp-build-a-pinterest-clone')) || {};
        let data = { username: this.state.user.username, userexpire: this.state.user.expire };
        localStorage.setItem('freecodecamp-build-a-pinterest-clone', JSON.stringify(data));
      }

      return;
    };
  }

  setWebsocket() {
    this.state.webSocket = new WebSocket(`ws://localhost:3000`);
    // this.state.webSocket = new WebSocket(`wss://letsziggy-freecodecamp-dynamic-web-application-05.glitch.me`);

    this.state.webSocket.onopen = (event) => {
      console.log('open');
    };

    this.state.webSocket.onclose = (event) => {
      this.state.webSocketID = null;
      this.state.webSocket = null;
      console.log('close');
    };

    this.state.webSocket.onerror = (event) => {
      this.state.webSocketID = null;
      this.state.webSocket = null;
      console.log('error');
    };

    this.state.webSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      handleWebsocket(message, this.state);
    };
  }

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Build a Pinterest Clone';
    config.map([
      {
        route: '',
        redirect: 'home'
      },
      {
        route: 'home',
        name: 'home',
        moduleId: './resources/modules/home',
        title: 'Home',
        nav: true,
      },
      {
        route: 'user',
        name: 'user',
        moduleId: './resources/modules/user',
        title: 'User',
        nav: true,
      },
      {
        route: 'login',
        name: 'login',
        moduleId: './resources/modules/login',
        title: 'Login',
        nav: true,
      },
    ]);

    config.mapUnknownRoutes({ redirect: 'home' });
  }
}