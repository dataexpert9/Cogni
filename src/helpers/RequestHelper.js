import axios from 'axios';
import { jsonResponse } from './config.js';
import $ from 'jquery';

export class RequestHelper {
  APIPostRequest(url, params, callback) {
    // var headers = {
    //   'Accept': 'application/json',
    //   'Content-Type': 'application/json'
    // }
    if (params) {
     
      axios.post(jsonResponse.SERVER.NODESERVERHOST + url, params)
        .then(callback)
        .catch(function (error) {
          console.log(error);
        });
    }
    else {
      axios.post(jsonResponse.SERVER.NODESERVERHOST + url)
        .then(callback)
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  APIPostRequestWithFormData(url, bodyFormData, callback) {
    axios({
      method: 'post',
      url: jsonResponse.SERVER.APIHOST + url,
      data: bodyFormData,
    }).then(callback).catch(function (response) {
      //handle error
      console.log(response);
    });
  }

  NodeGetRequest(url, callback,auth) {
    if(auth)
    axios.defaults.headers.common['Authorization'] = 
                                'Bearer ' + auth;
    axios.get(jsonResponse.SERVER.NODESERVERHOST + url)
      .then(callback)
      .catch(function (error) {
        callback(error.response);
      });
  }

  NodePostRequest(url, model, callback) {
    if (model) {
      axios.post(jsonResponse.SERVER.NODESERVERHOST + url, model)
        .then(callback)
        .catch(function (error) {
          console.log(error);
        });
    }
    else {
      axios.post(jsonResponse.SERVER.NODESERVERHOST + url)
        .then(callback)
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  static SendPostMultipart(url, fromData, successCallback) {
    $.ajax({
      url: url,
      type: "POST",
      data: fromData,
      processData: false,
      contentType: false,
      beforeSend: function () {
      },
      success: successCallback,
      error: function (xhr, textStatus, errorThrown) {
        console.log('error');
      }, 
      complete: function () {
      }
    });
  }
}
