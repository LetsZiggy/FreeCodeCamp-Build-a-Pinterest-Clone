import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
  }

  canActivate() {
    if(this.state.user.username === null) {
        return(new Redirect('home'));
    }
  }

  attached() {
    this.initialise();
  }

  detached() {
  }

  async initialise() {
  }
}