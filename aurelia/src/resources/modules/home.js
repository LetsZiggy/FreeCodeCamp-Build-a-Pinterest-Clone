import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import imagesLoaded from 'imagesLoaded';
import Masonry from 'masonry';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(Router, EventAggregator, ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, EventAggregator, ApiInterface) {
    this.router = Router;
    this.ea = EventAggregator;
    this.api = ApiInterface;
    this.eaSubscription = null;
    this.imagesLoaded = null;
    this.Masonry = null;
    this.pins = []
  }

  attached() {
    this.initialise();
    this.eaSubscription = this.ea.subscribe('ws', () => { this.initialise(); });

    if(this.state.user.toAdd) {
      this.showAddPin();
      this.state.user.toAdd = false;
    }

    if(this.state.user.toLike) {
      if(this.state.user.toLike.poster !== this.state.user.username) {
        this.likePost(this.state.user.toLike);
      }

      this.state.user.toLike = null;
    }
  }

  detached() {
    this.eaSubscription.dispose();
  }

  async initialise() {
    if(!this.state.pins.length) {
      let response = await this.api.getPins();
      if(response.get) {
        this.state.pins = response.pins.map((v, i, a) => v);
      }
    }

    if(this.state.pins.length) {
      this.pins = this.state.pins.map((v, i, a) => v);
      this.setMasonry();
    }
  }

  showAddPin() {
    if(this.state.user.username) {
      document.getElementById('add-pin-content').style.visibility = 'visible';
      document.getElementById('add-pin-content').style.pointerEvents = 'auto';
    }
    else {
      this.state.user.toAdd = true;
      this.router.navigateToRoute('login');
    }
  }

  async likePost(pin) {
    if(this.state.user.username) {
      let index = pin.likes.indexOf(this.state.user.username);

      if(index === -1) {
        let response = await this.api.likePin({ id: pin.id }, this.state.user.username, this.state.webSocketID);

        if(response.like) {
          pin.likes.push(this.state.user.username);
          pin.elem.children[0].dataset.userLike = 'true';
        }
      }
      else {
        let response = await this.api.unlikePin({ id: pin.id }, this.state.user.username, this.state.webSocketID);

        if(response.unlike) {
          pin.likes.splice(index, 1);
          pin.elem.children[0].dataset.userLike = 'false';
        }
      }
    }
    else {
      this.state.user.toLike = pin;
      this.router.navigateToRoute('login');
    }
  }

  async deletePost(pin) {
    let response = await this.api.deletePin({ id: pin.id }, this.state.user.username, this.state.webSocketID);

    if(response.delete) {
      let index = this.state.pins.map((v, i, a) => v.id).indexOf(pin.id);
      this.state.pins.splice(index, 1);
      this.pins = this.state.pins.map((v, i, a) => v);
      this.setMasonry();
    }
  }

  imageLoad(pin) {
    let imageRatio = pin.elem.children[1].children[0].naturalWidth / pin.elem.children[1].children[0].naturalHeight;

    if(imageRatio <= 1.5) {
      pin.elem.classList.add('wide-10');
    }
    else {
      pin.elem.classList.add('wide-20');
    }
  }

  imageError(pin) {
    pin.elem.children[1].children[0].src = 'http://via.placeholder.com/250x250/000000/ffffff?text=Broken+Image+Link';
    this.setMasonry(pin.id);
  }

  setMasonry(pinID=null) {
    setTimeout(() => {
      let pinsElem = document.getElementById('pins');
      let options = { itemSelector: '.pin', percentPosition: true, transitionDuration: 0, stagger: 0 };

      if(pinID) {
        let pin = document.getElementById(pinID);
        this.imagesloaded = imagesLoaded(pin.children[1].children[0]);
        this.imagesloaded.on('progress', (instance, image) => {
          this.masonry = new Masonry(pinsElem, options);
          pin.style.visibility = 'visible';
        });
      }
      else {
        this.imagesloaded = imagesLoaded(document.getElementsByClassName('pin-image'));
        this.imagesloaded.on('always', (instance) => {
          this.masonry = new Masonry(pinsElem, options);
          Array.from(document.getElementsByClassName('pin')).forEach((v, i, a) => {
            v.style.visibility = 'visible';
          });
        });
      }
    }, 0);
  }
}