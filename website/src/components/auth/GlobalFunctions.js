import Axios from 'axios';

Axios.defaults.withCredentials = true

export async function sendgetajaxrequest(url, ret) {
  let _data = ret;
  try {
    await Axios({
      method: 'get',
      url: url,
      headers: { 'Content-Type': 'application/json', 'auth': window.sessionStorage.getItem("token") },
    }).then((res) => { if (typeof (res.data) === typeof (ret)) { _data = res.data }});
  }
  catch (e) { }
  return _data
}

export async function sendgetajaxrequestnoauth(url, ret) {
  let _data = ret;
  try {
    await Axios({
      method: 'get',
      url: url,
      headers: { 'Content-Type': 'application/json'},
    }).then((res) => { if (typeof (res.data) === typeof (ret)) { _data = res.data }});
  }
  catch (e) { }
  return _data
}

export async function sendpostajaxrequest(url, data, ret) {
  let _data = ret;
  try {
    await Axios({
      method: 'post',
      url: url,
      data: data,
      headers: { 'Content-Type': 'application/json', 'auth': window.sessionStorage.getItem("token") },
    }).then((res) => { if (typeof (res.data) === typeof (ret)) { _data = res.data }});
  }
  catch (e) { }

  return _data
}

export async function sendpostuploadrequest(url, data, ret) {
  let _data = ret;
  try {
    await Axios({
      method: 'post',
      url: url,
      data: data,
      headers: { 'auth': window.sessionStorage.getItem("token") },
    }).then((res) => { if (typeof (res.data) === typeof (ret)) { _data = res.data }});
  }
  catch (e) { }

  return _data
}

export async function sendpostajaxrequestnoauth(url, data, ret) {
  let _data = ret;
  try {
    await Axios({
      method: 'post',
      url: url,
      data: data,
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => { if (typeof (res.data) === typeof (ret)) { _data = res.data }});
  }
  catch (e) { }

  return _data
}

export function setstateasync(state) {
  return new Promise((resolve) => {this.setState(state, resolve)});
}