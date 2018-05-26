import {bindable, bindingMode, observable} from 'aurelia-framework';

let regex = new RegExp('^[-_a-zA-Z0-9 \.\']$');
let specialKeys = ['Enter', 'Shift', 'Alt', 'Control', 'Backspace', 'Insert', 'Del', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Up', 'ArrowUp', 'Down', 'ArrowDown', 'Left', 'ArrowLeft', 'Right', 'ArrowRight', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

export class AddPin {
  @bindable setMasonry;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) api;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) pins;

  @observable image = '';
  @observable title = '';

  constructor() {
    this.error = false;
  }

  clearForm() {
    this.image = '';
    this.title = '';
    this.error = false;

    let imageElem = document.getElementById('add-pin-image-element');
    imageElem.src = this.image;
    imageElem.classList.remove('wide');
    imageElem.classList.remove('tall');

    setTimeout(() => {
      let imageInputElem = document.getElementById('add-pin-image-input');
      imageInputElem.classList.remove('error');

      let titleInputElem = document.getElementById('add-pin-title-input');
      titleInputElem.classList.remove('error');

      let imageDisplayElem = document.getElementById('add-pin-image-display');
      imageDisplayElem.style.backgroundImage = 'url("https://material.io/tools/icons/static/icons/baseline-image-24px.svg")';
    }, 25);
  }

  closeAddPin() {
    this.clearForm();
    document.getElementById('add-pin-content').style.visibility = 'hidden';
    document.getElementById('add-pin-content').style.pointerEvents = 'none';
  }

  imageChanged(newValue, oldValue) {
    let imageElem = document.getElementById('add-pin-image-element');
    let imageInputElem = document.getElementById('add-pin-image-input');
    let imageDisplayElem = document.getElementById('add-pin-image-display');

    if(newValue.length) {
      imageElem.src = newValue;

      setTimeout(() => {
        let imageRatio = imageElem.naturalWidth / imageElem.naturalHeight;

        if(imageRatio >= 1.5) {
          imageElem.classList.add('wide');
          imageElem.classList.remove('tall');
          imageInputElem.classList.remove('error');
          this.error = false;
        }
        else if(imageRatio < 1.5) {
          imageElem.classList.add('tall');
          imageElem.classList.remove('wide');
          imageInputElem.classList.remove('error');
          this.error = false;
        }
      }, 25);
    }
    else {
      imageDisplayElem.style.backgroundImage = 'url("https://material.io/tools/icons/static/icons/baseline-image-24px.svg")';
    }
  }

  titleChanged(newValue, oldValue) {
    let titleInputElem = document.getElementById('add-pin-title-input');

    if(!newValue.length) {
      titleInputElem.classList.add('error');
    }
    else {
      titleInputElem.classList.remove('error');
    }
  }

  checkInput(event) {
    if(regex.test(event.key) || specialKeys.includes(event.key)) {
      return(true);
    }
    else {
      return(false);
    }
  }

  imageError(input) {
    let imageElem = document.getElementById('add-pin-image-element');
    let imageInputElem = document.getElementById('add-pin-image-input');
    let imageDisplayElem = document.getElementById('add-pin-image-display');

    if(input === 'error'){
      imageElem.classList.remove('wide');
      imageElem.classList.remove('tall');
      imageInputElem.classList.add('error');
      imageDisplayElem.style.backgroundImage = 'url("https://material.io/tools/icons/static/icons/baseline-broken_image-24px.svg")';
      this.error = true;
    }
  }

  addPin() {
    let response = this.api.addPin({ image: this.image, title: this.title }, this.state.user.username);

    if(response.add) {
      let pin = {
        id: response.data.id,
        image: this.image,
        title: this.title,
        poster: this.state.user.username,
        likes: []
      };

      this.state.pins.push(pin);
      this.pins.push(pin);
      this.setMasonry({ pinID: response.data.id });
      this.closeAddPin();
    }
  }
}