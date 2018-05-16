import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(Router, ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
  }

  attached() {
    this.initialise();
  }

  detached() {
  }

  async initialise() {
  }
}