import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(Router, ApiInterface)
export class Pin {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.pin = null;
    this.pinID = null;
    this.pinLikes = 0;
  }

  canActivate(params, routeConfig, navigationInstruction) {
    if(params.id === undefined || !this.state.pins.length) {
      return(new Redirect('home'));
    }
  }

  activate(params, routeConfig, navigationInstruction) {
    this.pinID = params.id;
  }

  attached() {
    this.initialise();

    if(this.state.user.toLike) {
      if(this.state.user.toLike.poster !== this.state.user.username) {
        this.likePost(this.state.user.toLike);
      }

      this.state.user.toLike = null;
    }
  }

  detached() {
    this.pinID = null;
    this.pin = null;
  }

  async initialise() {
    let index = this.state.pins.map((v, i, a) => v.id).indexOf(this.pinID);
    this.pin = this.state.pins[index];
    this.pinLikes = this.pin.likes.length;
  }

  async likePost() {
    if(this.state.user.username) {
      let response = await this.api.likePin(this.pin.id, this.state.user.username);

      if(response.like) {
        let likeElem = document.getElementById('pin-like');
        let index = this.pin.likes.indexOf(this.state.user.username);

        if(index === -1) {
          this.pin.likes.push(this.state.user.username);
          likeElem.dataset.userLike = 'true';
        }
        else {
          this.pin.likes.splice(index, 1);
          likeElem.dataset.userLike = 'false';
        }
      }

      this.pinLikes = this.pin.likes.length;
    }
    else {
      this.state.user.toLike = this.pin;
      this.router.navigateToRoute('login');
    }
  }

  imageError(pin) {
    pin.elem.children[1].children[0].src = 'http://via.placeholder.com/250x250/000000/ffffff?text=Broken+Image+Link';
    this.setMasonry(pin.id);
  }
}