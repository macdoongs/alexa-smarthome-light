
// namespaces

const NAMESPACE_ALEXA = "Alexa";

const NAMESPACE_DISCOVERY = "Alexa.Discovery";

const NAMESPACE_POWER_CONTROL = "Alexa.PowerController";

const NAMESPACE_POWER_LEVEL_CONTROL = "Alexa.PowerLevelController";

const NAMESPACE_BRIGHTNESS_CONTROL = "Alexa.BrightnessController";

const NAMESPACE_COLOR_CONTROL = "Alexa.ColorController";

const NAMESPACE_COLOR_TEMPERATURE_CONTROL = "Alexa.ColorTemperatureController";

// discovery

const REQUEST_DISCOVER = "Discover";

const RESPONSE_DISCOVER = "Discover.Response";

// control

const REQUEST_TURN_ON = "TurnOn";

const RESPONSE_TURN_ON = "TurnOnConfirmation";

const REQUEST_TURN_OFF = "TurnOff";

const RESPONSE_TURN_OFF = "TurnOffConfirmation";

// errors

const RESPONSE_ERROR = "ErrorResponse";

const ERROR_UNSUPPORTED_OPERATION = "UnsupportedOperationError";

const ERROR_UNEXPECTED_INFO = "UnexpectedInformationReceivedError";


// version

const PAYLOAD_VERSION = "3";

var requestedNamespace = "";

// entry

exports.handler = function (event, context, callback) {

  log("Received Directive", event);

  requestedNamespace = event.directive.header.namespace;

  var response = null;

  try {

    switch (requestedNamespace) {

      case NAMESPACE_DISCOVERY:

        response = handleDiscovery(event);

        break;

      case NAMESPACE_POWER_CONTROL:

        response = handlePowerControl(event);

        break;

      case NAMESPACE_POWER_LEVEL_CONTROL:

        response = handlePowerLevelControl(event);

        break;

      case NAMESPACE_BRIGHTNESS_CONTROL:

        response = handleBrightnessControl(event);

        break;

      case NAMESPACE_COLOR_CONTROL:

        response = handleColorControl(event);

        break;

      case NAMESPACE_COLOR_TEMPERATURE_CONTROL:

        response = handleColorTemperatureControl(event);

        break;

      default:

        log("Error", "Unsupported namespace: " + requestedNamespace);

        response = handleUnexpectedInfo(event);

        break;

    }// switch

  } catch (error) {

    log("Error", error);

  }// try-catch

  callback(null, response);

}// exports.handler


var handleDiscovery = function(event) {

  var header = createHeader(NAMESPACE_DISCOVERY, RESPONSE_DISCOVER, null);

  // TODO modify
  var payload = {

    "endpoints": [
      {

        "endpointId":"appliance-001",

        "friendlyName":"Smart Home Virtual Device",

        "description":"Smart Light by Sample Manufacturer",

        "manufacturerName":"yourManufacturerName",

        "displayCategories":[
          "LIGHT"
        ],

        "cookie":{

           "extraDetail1":"optionalDetailForSkillAdapterToReferenceThisDevice",

           "extraDetail2":"There can be multiple entries",

           "extraDetail3":"but they should only be used for reference purposes.",

           "extraDetail4":"This is not a suitable place to maintain current device state"

         },

         "capabilities":[
            {
               "type":"AlexaInterface",
               "interface":"Alexa.ColorTemperatureController",
               "version":"3",
               "properties":{
                  "supported":[
                     {
                        "name":"colorTemperatureInKelvin"
                     }
                  ],
                  "proactivelyReported":true,
                  "retrievable":true
               }
            },
            {
                "type": "AlexaInterface",
                "interface": "Alexa.PowerController",
                "version": "3",
                "properties": {
                  "supported": [ {
                    "name": "powerState"
                  } ],
                  "proactivelyReported": true,
                  "retrievable": true
               }
            },
            {
               "type":"AlexaInterface",
               "interface":"Alexa",
               "version":"3"
            },
            {
               "type":"AlexaInterface",
               "interface":"Alexa.ColorController",
               "version":"3",
               "properties":{
                  "supported":[
                     {
                        "name":"color"
                     }
                  ],
                  "proactivelyReported":true,
                  "retrievable":true
               }
            }
         ]
      }
    ]

  };

  return createDirective(header,payload);

}// handleDiscovery


var handlePowerControl = function(event) {

  var response = null;

  var requestedName = event.directive.header.name;

  switch (requestedName) {

    case REQUEST_TURN_ON :

      response = handlePowerControlTurnOn(event);

      break;

    case REQUEST_TURN_OFF :

      response = handlePowerControlTurnOff(event);

      break;

    default:

      log("Error", "Unsupported operation" + requestedName);

      response = handleUnsupportedOperation(event);

      break;

  }// switch

  return response;

}// handlePowerControl


var handlePowerControlTurnOn = function(event) {
  var correlationToken = event.directive.header.correlationToken;
  var header = createHeader(NAMESPACE_POWER_CONTROL, RESPONSE_TURN_ON, correlationToken);

  var payload = {};

  payload.code = 0;
  payload.message = "turn on the light";

  return createDirective(header,payload);
}// handlePowerControlTurnOn


var handlePowerControlTurnOff = function(event) {
  var correlationToken = event.directive.header.correlationToken;
  var header = createHeader(NAMESPACE_POWER_CONTROL, RESPONSE_TURN_OFF, correlationToken);

  var payload = {};

  payload.code = 0;
  payload.message = "turn off the light";

  return createDirective(header, payload);
}// handlePowerControlTurnOff


var handlePowerLevelControl = function(event) {
  var response = {
   "context":{
      "properties":[
         {
            "namespace":"Alexa.PowerLevelController",
            "name":"powerLevel",
            "value": 42,
            "timeOfSample":"2017-02-03T16:20:50.52Z",
            "uncertaintyInMilliseconds": 0
         }
      ]
   },
   "event":{
      "header":{
         "namespace":"Alexa",
         "name":"Response",
         "messageId":"30d2cd1a-ce4f-4542-aa5e-04bd0a6492d5",
         "correlationToken":"dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg==",
         "payloadVersion":"3"
      },
      "endpoint":{
         "scope":{
            "type":"BearerToken",
            "token":"access-token-from-Amazon"
         },
         "endpointId":"appliance-001"
      },
      "payload":{ }
   }
};

  return response;
}// handlePowerLevelControl


var handleBrightnessControl = function(event) {
  var response = {
    "context": {
      "properties": [ {
        "namespace": "Alexa.BrightnessController",
        "name": "brightness",
        "value": 42,
        "timeOfSample": "2017-02-03T16:20:50.52Z",
        "uncertaintyInMilliseconds": 1000
      } ]
    },
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "payloadVersion": "3",
        "messageId": "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4",
        "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
      },
      "endpoint": {
        "scope": {
          "type": "BearerToken",
          "token": "access-token-from-Amazon"
        },
        "endpointId": "appliance-001"
      },
      "payload": {}
    }
  };

  return response;
}// handleBrightnessControl


var handleColorControl = function(event) {
  var response = {
    "context": {
        "properties": [ {
            "namespace": "Alexa.ColorController",
            "name": "color",
            "value": {
                "hue": 350.5,
                "saturation": 0.7138,
                "brightness": 0.6524
            },
            "timeOfSample": "2017-02-03T16:20:50.52Z",
            "uncertaintyInMilliseconds": 1000
        } ]
    },
    "event": {
        "header": {
            "namespace": "Alexa",
            "name": "Response",
            "payloadVersion": "3",
            "messageId": "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4",
            "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
        },
        "endpoint": {
            "scope": {
              "type": "BearerToken",
              "token": "access-token-from-Amazon"
      },
            "endpointId": "appliance-001"
        },
        "payload": {}
    }
  };

  return response;
}// handleColorControl


var handleColorTemperatureControl = function(event) {
  var response = {
    "context": {
        "properties": [ {
            "namespace": "Alexa.ColorTemperatureController",
            "name": "colorTemperatureInKelvin",
            "value": 7500,
            "timeOfSample": "2017-02-03T16:20:50.52Z",
            "uncertaintyInMilliseconds": 500
        } ]
    },
    "event": {
        "header": {
            "namespace": "Alexa",
            "name": "Response",
            "payloadVersion": "3",
            "messageId": "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4",
            "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
        },
        "endpoint": {
            "scope": {
              "type": "BearerToken",
              "token": "access-token-from-Amazon"
            },
            "endpointId": "appliance-001"
        },
        "payload": {}
    }
  };

  return response;
}// handleColorTemperatureControl


var handleUnsupportedOperation = function(event) {
  var correlationToken = event.directive.header.correlationToken;
  var header = createHeader(NAMESPACE_POWER_CONTROL, ERROR_UNSUPPORTED_OPERATION, correlationToken);

  var payload = {};

  return createDirective(header,payload);

}// handleUnsupportedOperation


var handleUnexpectedInfo = function(event) {
  var correlationToken = event.directive.header.correlationToken;

  var header = createHeader(NAMESPACE_POWER_CONTROL, ERROR_UNEXPECTED_INFO, correlationToken);

  var payload = {

    "faultingParameter" : requestedNamespace

  };

  return createDirective(header, payload);

}// handleUnexpectedInfo


// support functions

var createMessageId = function() {

  var d = new Date().getTime();

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {

    var r = (d + Math.random()*16)%16 | 0;

    d = Math.floor(d/16);

    return (c=='x' ? r : (r&0x3|0x8)).toString(16);

  });

  return uuid;

}// createMessageId


var createHeader = function(name, correlationToken) {

  var header = {
    "messageId": createMessageId(),

    "namespace": namespace,

    "name": name,

    "payloadVersion": PAYLOAD_VERSION
  };

  if(namespace != NAMESPACE_DISCOVERY){
    header.correlationToken = correlationToken;
  }

  //log("create", header);

  return header;

}// createHeader


var createEvent = function(namespace, header, endpoint, payload) {

}// createEvent


var createDirective = function(header, payload) {
  var directive = {
    "event":{
      "header" : header,

      "payload" : payload
    }
  }

  //log("create", directive);

  return directive;

}// createDirective


var log = function(title, msg) {

  console.log('**** ' + title + ': ' + JSON.stringify(msg));

}// log
