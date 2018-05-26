import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(Router, ApiInterface)
export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.checkNameValue = null;
    this.checkNameTaken = false;
    this.radio = null;
    this.hasLogin = false;
    this.prevLocation = null;
  }

  async canActivate(params, routeConfig, navigationInstruction) {
    this.prevLocation = this.router.history.previousLocation;

    if(this.state.user.username) {
      let data = JSON.parse(localStorage.getItem('freecodecamp-build-a-pinterest-clone')) || {};
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

      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      localStorage.setItem('freecodecamp-build-a-pinterest-clone', JSON.stringify(data));

      return(new Redirect('home'));
    }
  }

  attached() {
    if(this.state.login.timer) {
      this.radio = 'radio-signin';
      document.getElementById('radio-delay').checked = true;
      setTimerInterval(this.state, this.radio, 'signin');
    }
  }

  detached() {
    if(!this.hasLogin) {
      this.state.user.toLike = null;
      this.state.user.toAdd = false;
    }

    if(this.state.login.timer) {
      clearInterval(this.state.login.interval);
    }

    this.checkNameValue = null;
    this.prevLocation = null;
  }

  async checkInput(event, form) {
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    let errors = { inputLength: false, matching: false, email: false };
    let inputs = document.getElementById(form).getElementsByTagName('input');
    inputs = Array.from(inputs);

    inputs.forEach((v, i, a) => {
      v.dataset.length = v.value.length;
      let min = v.getAttribute('minlength') || false;
      if(min === false && !emailRegex.test(v.value)) {
        errors.email = true;
      }
      else if(v.value.length < min) {
        errors.inputLength = true;
      }
    });

    if(inputs.length === 4 && inputs[2].value !== inputs[3].value) {
      errors.matching = true;
    }

    if(inputs[0].value.length >= inputs[0].getAttribute('minlength') && form === 'signup' && inputs[0].value !== this.checkNameValue) {
      this.checkNameValue = inputs[0].value;
      this.checkNameTaken = await this.api.getUserNames(this.checkNameValue);
    }

    setError(form, errors, this.checkNameTaken);
    return(true);
  }

  clearForm(form) {
    document.getElementById('wrong-login').style.display = 'none';
    document.getElementById(`${form}-submit`).disabled = true;
    resetForm(document.getElementById(form));
    return(true);
  }

  async handleForm(form) {
    let result = null;
    let formSuccess = false;

    if(form === 'signup') {
      result = await this.api.createUser({ username: document.getElementById(`${form}-username`).value, email: document.getElementById(`${form}-email`).value.toLowerCase(), password: document.getElementById(`${form}-password`).value });
      formSuccess = result.create;
    }
    else if(form === 'signin') {
      result = await this.api.getUser({ username: document.getElementById(`${form}-username`).value, password: document.getElementById(`${form}-password`).value });
      formSuccess = result.get;
    }
    else {
      result = await this.api.editUser({ username: document.getElementById(`${form}-username`).value, email: document.getElementById(`${form}-email`).value.toLowerCase(), password: document.getElementById(`${form}-password`).value });
      formSuccess = result.update;
    }

    // check results
    if(!formSuccess && form === 'signup') {
      document.getElementById('wrong-login').innerHTML = '<div>Sorry, we weren\'t able to process your signup.</div><div>Please try again.</div>';
      document.getElementById('wrong-login').style.display = 'flex';
      resetForm(document.getElementById(form));
    }
    else if(!formSuccess && (form === 'signin' || form === 'signreset')) {
      if(this.state.login.chance) {
        this.state.login.chance--;

        if(form === 'signin') {
          document.getElementById('wrong-login').innerHTML = '<div>You have typed in the wrong credentials.</div>';
        }
        else {
          document.getElementById('wrong-login').innerHTML = '<div>You have typed in the wrong username or email.</div>';
        }
        document.getElementById('wrong-login').style.display = 'flex';
        resetForm(document.getElementById(form));
      }
      else {
        this.radio = `radio-${form}`;
        this.state.login.chance = 2;
        this.state.login.delay++;
        this.state.login.timer = 30 * this.state.login.delay;
        document.getElementById('radio-delay').checked = true;

        setTimerInterval(this.state, this.radio, form);
      }
    }
    else {
      this.state.user.username = document.getElementById(`${form}-username`).value;
      this.state.user.expire = result.expire;

      this.state.user.interval = setTimeout(async () => {
        let logout = await this.api.logoutUser();

        if(this.state.user.interval) {
          clearInterval(this.state.user.interval);
          this.state.user.interval = null;
        }

        this.state.user.username = null;
        this.state.user.expire = null;
        console.log('logout');
      }, (this.state.user.expire - Date.now()));

      if(this.state.webSocketID) {
        this.state.webSocket.send(JSON.stringify({ type: 'login', username: this.state.user.username }));
      }

      this.hasLogin = true;

      if(this.prevLocation.includes('/user')) {
        this.router.navigateToRoute('user', { username: decodeURI(this.prevLocation.slice(6)) });
      }
      else if(this.prevLocation.includes('/pin')) {
        this.router.navigateToRoute('pin', { id: decodeURI(this.prevLocation.slice(5)) });
      }
      else {
        this.router.navigateToRoute('home');
      }
    }
  }
}

function setError(form, errors, checkNameTaken) {
  let errArr = [];

  if(checkNameTaken) {
    errArr.push('<div>The username is already in use.</div>');
  }
  if(errors.matching) {
    errArr.push('<div>Your password doesn\'t match.</div>');
  }
  if(errors.email) {
    errArr.push('<div>Please provide a valid email address.</div>');
  }
  if(errors.inputLength) {
    errArr.push('<div>Username needs at least 6 characters</div><div>Password needs at least 8 characters.</div>');
  }
  
  let errMsg = errArr.reduce((acc, v, i, a) => acc += v, '');

  document.getElementById('wrong-login').innerHTML = errMsg;

  if(errors.inputLength || checkNameTaken || errors.matching || errors.email) {
    document.getElementById(`${form}-submit`).disabled = true;
    document.getElementById('wrong-login').style.display = 'flex';
  }
  else {
    document.getElementById(`${form}-submit`).disabled = false;
    document.getElementById('wrong-login').style.display = 'none';
  }
}

function resetForm(form) {
  form.reset();
  Array.from(form.children).forEach((v, i, a) => {
    if(v.children[0].hasAttribute('data-length') && v.children[0].getAttribute('data-length') !== '0') {
      v.children[0].setAttribute('data-length', 0);
    }
  });
}

function setTimerInterval(state, radio, form) {
  state.login.interval = setInterval(() => {
    state.login.timer--;
    if(state.login.timer === 0) {
      document.getElementById(radio).checked = true;
      document.getElementById('wrong-login').style.display = 'none';
      resetForm(document.getElementById(form));
      clearInterval(state.login.interval);
    }
  }, 1000);
}