
/***********
 namespaces
********* */
const NAMESPACE_ALEXA = "Alexa";

const NAMESPACE_DISCOVERY = "Alexa.Discovery";

const NAMESPACE_POWER_CONTROL = "Alexa.PowerController";

const NAMESPACE_POWER_LEVEL_CONTROL = "Alexa.PowerLevelController";

const NAMESPACE_BRIGHTNESS_CONTROL = "Alexa.BrightnessController";

const NAMESPACE_COLOR_CONTROL = "Alexa.ColorController";

const NAMESPACE_COLOR_TEMPERATURE_CONTROL = "Alexa.ColorTemperatureController";


/***********
  names
********* */

/*  request names */

/* discovery */
const NAME_REQUEST_DISCOVER = "Discover";

/* control */
// power
const NAME_REQUEST_TURN_ON = "TurnOn";

const NAME_REQUEST_TURN_OFF = "TurnOff";

// power Level
const NAME_REQUEST_ADJUST_POWER_LEVEL = "AdjustPowerLevel";

const NAME_REQUEST_SET_POWER_LEVEL = "SetPowerLevel";

// brightness
const NAME_REQUEST_ADJUST_BRIGHTNESS = "AdjustBrightness";

const NAME_REQUEST_SET_BRIGHTNESS = "SetBrightness";

// color
const NAME_REQUEST_SET_COLOR = "SetColor";

// color temperature
const NAME_REQUEST_DECREASE_COLOR_TEMPERATURE = "DecreaseColorTemperature";

const NAME_REQUEST_INCREASE_COLOR_TEMPERATURE = "IncreaseColorTemperature";

const NAME_REQUEST_SET_COLOR_TEMPERATURE = "SetColorTemperature";


/*  response names  */

/* event */
// default
const NAME_RESPONSE = "Response";

// discovery
const NAME_RESPONSE_DISCOVER = "Discover.Response";

// error
const NAME_RESPONSE_ERROR = "ErrorResponse";

const NAME_ERROR_UNSUPPORTED_OPERATION = "UnsupportedOperationError";

const NAME_ERROR_UNEXPECTED_INFO = "UnexpectedInformationReceivedError";


/* properties */
// power
const NAME_RESPONSE_POWER = "powerState";

// power level
const NAME_RESPONSE_POWER_LEVEL = "SetPowerLevel";

// brightness
const NAME_RESPONSE_BRIGHTNESS = "brightness";

// color
const NAME_RESPONSE_COLOR = "color";

// color temperature
const NAME_RESPONSE_COLOR_TEMPERATURE = "colorTemperatureInKelvin";


/* parameters */
// alexa smart light
const ALEXA_SL_POWER_ON = "ON";
const ALEXA_SL_POWER_OFF = "OFF";

// system light API
const SL_API_POWER_ON = "on";
const SL_API_POWER_OFF = "off";

const DEFAULT_POWER_LEVEL = 1000;

/***********
 version
********* */
const PAYLOAD_VERSION = "3";


/***********
 modules
********* */
const request = require("request");
const config = require("config.json")("./config/config.json");
const async = require("async");


// Temp Light's gateway IP address
const BASE_URL = config.sl.gw;

var requestedNamespace = "";
var requestedName = "";

// entry
exports.handler = function(event, context, callback){
  console.log("handler");
  log("Received Directive", event);

  requestedNamespace = event.directive.header.namespace;
  requestedName = event.directive.header.name;

  try {
    switch(requestedNamespace){
      case NAMESPACE_DISCOVERY:
        handleDiscovery(event, function(error, directive){
          callback(null, directive);
        });

        break;
      case NAMESPACE_POWER_CONTROL:
        handlePowerControl(event, function(error, directive){
          callback(null, directive);
        });

        break;
      case NAMESPACE_POWER_LEVEL_CONTROL:
        handlePowerLevelControl(event, function(error, directive){
          callback(null, directive);
        });

        break;
      case NAMESPACE_BRIGHTNESS_CONTROL:
        handleBrightnessControl(event, function(error, directive){
          callback(null, directive);
        });

        break;
      case NAMESPACE_COLOR_CONTROL:
        handleColorControl(event, function(error, directive){
          callback(null, directive);
        });

        break;
      case NAMESPACE_COLOR_TEMPERATURE_CONTROL:
        handleColorTemperatureControl(event, function(error, directive){
          callback(null, directive);
        });

        break;
      default:
        log("Error", "Unsupported namespace: " + requestedNamespace);

        handleUnexpectedInfo(event, function(error, directive){
          callback(null, directive);
        });

        break;
    }// switch
  } catch(error){
    log("Error", error);
  }// try-catch
};// exports.handler


function handleDiscovery(event, callback){
  console.log("handleDiscovery");

  async.parallel({
    header: function(callback){
      createHeader(NAMESPACE_DISCOVERY, NAME_RESPONSE_DISCOVER, null, function(error, header){
        callback(null, header);
      });
    },
    payload: function(callback){
      createEndpoints(function(error, endpoints){
        var payload = {};

        payload.endpoints = endpoints;

        callback(null, payload);
      });
    }
  }, function(error, results){
    const header = results.header;
    const payload = results.payload;

    async.waterfall([
      function(callback){
        createEvent(header, null, payload, function(error, event){
          callback(null, event);
        });
      },
      function(event, callback){
        createDirective(null, event, function(error, directive){
          callback(null, directive);
        });
      }
    ], function(error, result){
      callback(null, result);
    });
  });
}// handleDiscovery


function handlePowerControl(event, callback){
  console.log("handlePowerControl");

  switch(requestedName){
    case NAME_REQUEST_TURN_ON :
      handlePower(event, SL_API_POWER_ON, function(error, directive){
        callback(null, directive);
      });

      break;
    case NAME_REQUEST_TURN_OFF :
      handlePower(event, SL_API_POWER_OFF, function(error, directive){
        callback(null, directive);
      });

      break;
    default:
      log("Error", "Unsupported operation" + requestedName);

      handleUnsupportedOperation(event, function(error, directive){
        callback(null, directive);
      });

      break;
  }// switch
}// handlePowerControl


function handlePower(event, onoff, callback){
  console.log("handlePowerControlTurnOn");

  // make query
  var deviceId = event.directive.endpoint.endpointId;
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  var level = DEFAULT_POWER_LEVEL;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  var data = {
    url: lightUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    // Make Alexa response
    makeControlResponse(event, NAME_RESPONSE_POWER, onoff, function(error, response){
      callback(null, response);
    });
  });
}// handlePower


function handlePowerLevelControl(event, callback){
  console.log("handlePowerLevelControl");

  switch(requestedName){
    case NAME_REQUEST_ADJUST_POWER_LEVEL :
      adjustPowerLevel(event, function(error, directive){
        callback(null, directive);
      });

      break;
    case NAME_REQUEST_SET_POWER_LEVEL :
      setPowerLevel(event, function(error, directive){
        callback(null, directive);
      });

      break;
    default:
      log("Error", "Unsupported operation" + requestedName);

      handleUnsupportedOperation(event, function(error, directive){
        callback(null, directive);
      });

      break;
  }// switch
}

function adjustPowerLevel(event, callback){
  console.log("adjustPowerLevel");

  var directive = require("./response_templates/power_level/power_level.json");

  callback(null, directive);
}// handlePowerLevelControl

function setPowerLevel(event, callback){
  console.log("setPowerLevel");

  // Request query
  const deviceId = event.directive.endpoint.endpointId;
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = event.directive.payload.powerLevel;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  var data = {
    url: lightUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    // Make Alexa response
    makeControlResponse(event, NAME_RESPONSE_POWER_LEVEL, level, function(error, response){
      callback(null, response);
    });
  });
}

function handleBrightnessControl(event, callback){
  console.log("handleBrightnessControl");

  switch(requestedName){
    case NAME_REQUEST_ADJUST_BRIGHTNESS :
      adjustBrightness(event, function(error, directive){
        callback(null, directive);
      });

      break;

    case NAME_REQUEST_SET_BRIGHTNESS :
      setBrightness(event, function(error, directive){
        callback(null, directive);
      });

      break;

    default:
      log("Error", "Unsupported operation" + requestedName);

      handleUnsupportedOperation(event, function(error, directive){
        callback(null, directive);
      });

      break;
  }// switch
}// handleBrightnessControl

function adjustBrightness(event, callback){
  console.log("adjustBrightness");

  var response = require("./response_templates/brightness/brightness.json");

  callback(null, response);
}

function setBrightness(event, callback){
  console.log("setBrightness");

  // Request query
  const deviceId = event.directive.endpoint.endpointId;
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  const brightness = event.directive.payload.brightness;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // brightness
  body.brightness = brightness;

  var data = {
    url: lightUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    // Make Alexa response
    makeControlResponse(event, NAME_RESPONSE_BRIGHTNESS, brightness, function(error, response){
      callback(null, response);
    });
  });
}

function handleColorControl(event, callback){
  console.log("handleColorControl");

  // Request query
  const deviceId = event.directive.endpoint.endpointId;
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  const color = event.directive.payload.color;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // color
  body.hue = color.hue;
  body.saturation = color.saturation;
  body.brightness = color.brightness;

  var data = {
    url: lightUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    // Make Alexa response
    makeControlResponse(event, NAME_RESPONSE_COLOR, color, function(error, response){
      callback(null, response);
    });
  });
}// handleColorControl


function handleColorTemperatureControl(event, callback){
  console.log("handleColorTemperatureControl");

  switch(requestedName){
    case NAME_REQUEST_DECREASE_COLOR_TEMPERATURE :
      decreaseColorTemperature(event, function(error, directive){
        callback(null, directive);
      });

      break;
    case NAME_REQUEST_INCREASE_COLOR_TEMPERATURE :
      increaseColorTemperature(event, function(error, directive){
        callback(null, directive);
      });

      break;
    case NAME_REQUEST_SET_COLOR_TEMPERATURE :
      setColorTemperature(event, function(error, directive){
        callback(null, directive);
      });

      break;
    default:
      log("Error", "Unsupported operation" + requestedName);

      handleUnsupportedOperation(event, function(error, directive){
        callback(null, directive);
      });

      break;
  }// switch
}// handleColorTemperatureControl


function decreaseColorTemperature(event, callback){
  console.log("decreaseColorTemperature");

  // TODO modify temporary response
  var response = require("./response_templates/color_temperature/color_temperature.json");

  callback(null, response);
}


function increaseColorTemperature(event, callback){
  console.log("increaseColorTemperature");

  // TODO modify temporary response
  var response = require("./response_templates/color_temperature/color_temperature.json");

  callback(null, response);
}


function setColorTemperature(event, callback){
  console.log("setColorTemperature");

  // Request query
  const deviceId = event.directive.endpoint.endpointId;
  const lightUrl = BASE_URL + "/device/" + deviceId + "/light";

  const onoff = SL_API_POWER_ON;
  const level = DEFAULT_POWER_LEVEL;

  const colorTemperatureInKelvin = event.directive.payload.colorTemperatureInKelvin;

  var body = {};
  body.onoff = onoff;
  body.level = level;

  // color
  body.colorTemp = color.colorTemperatureInKelvin;

  var data = {
    url: lightUrl,
    form: body
  }

  // request gateway
  request.put(data, function(error, httpResponse, body){
    // Make Alexa response
    makeControlResponse(event, NAME_RESPONSE_COLOR_TEMPERATURE, colorTemperatureInKelvin, function(error, response){
      callback(null, response);
    });
  });
}


function handleUnsupportedOperation(event, callback){
  console.log("handleUnsupportedOperation");

  const correlationToken = event.directive.header.correlationToken;

  var endpoint = {};
  var payload = {};
  var context = {};

  async.waterfall([
    function(callback){
      createHeader(NAMESPACE_POWER_CONTROL, NAME_ERROR_UNSUPPORTED_OPERATION, correlationToken, function(error, header){
        callback(null, header);
      });
    },
    function(header, callback){
      createEvent(header, endpoint, payload, function(error, event){
        callback(null, event);
      });
    },
    function(event, callback){
      createDirective(context, event, function(error, directive){
        callback(null, directive);
      });
    }
  ], function(error, result){
    callback(null, result);
  });
}// handleUnsupportedOperation


function handleUnexpectedInfo(event, callback){
  console.log("handleUnexpectedInfo");

  const correlationToken = event.directive.header.correlationToken;
  var payload = {
    "faultingParameter" : requestedNamespace
  };
  var context = {};

  async.waterfall([
    function(callback){
      createHeader(NAMESPACE_POWER_CONTROL, NAME_ERROR_UNEXPECTED_INFO, correlationToken, function(error, header){
        callback(null, header);
      });
    },
    function(header, callback){
      createEvent(header, null, payload, function(error, event){
        callback(null, event);
      });
    },
    function(event, callback){
      createDirective(context, event, function(error, directive){
        callback(null, directive);
      });
    }
  ], function(error, result){
    callback(null, result);
  });
}// handleUnexpectedInfo


// support functions

var createMessageId = function(){

  var d = new Date().getTime();

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){

    var r =(d + Math.random()*16)%16 | 0;

    d = Math.floor(d/16);

    return(c=='x' ? r :(r&0x3|0x8)).toString(16);

  });

  return uuid;
}// createMessageId

function createEndpoints(callback){
  var endpoints = [];

  // Test data
  // Virtual Devices
  var endpoint1 = require("./endpoint_templates/endpoint1");

  var endpoint2 = require("./endpoint_templates/endpoint2");

  var endpoint3 = require("./endpoint_templates/endpoint3");

  var endpoint4 = require("./endpoint_templates/endpoint4");

  var endpoint5 = require("./endpoint_templates/endpoint5");

  var endpoint6 = require("./endpoint_templates/endpoint6");

  var endpoint7 = require("./endpoint_templates/endpoint7");

  endpoints.push(endpoint1, endpoint2, endpoint3, endpoint4, endpoint5, endpoint6, endpoint7);

  callback(null, endpoints);
}// createEndpoints

function createContext(event, name, value, callback){

  var context = {};

  var propertyArray = [];

  var propertyObject = {};

  propertyObject.namespace = requestedNamespace;
  propertyObject.name = name;
  propertyObject.value = value;
  propertyObject.timeOfSample = new Date().toJSON();
  propertyObject.uncertaintyInMilliseconds = 500;

  propertyArray.push(propertyObject);

  context.properties = propertyArray;

  log("context :", context);

  callback(null, context);
}// createContext


function createHeader(namespace, name, correlationToken, callback){
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

  callback(null, header);
}// createHeader


function createEvent(header, endpoint, payload, callback){
  var event = {};

  event.header = header;
  event.payload = payload;

  if(endpoint === null){
  }else{
    event.endpoint = endpoint;
  }

  log("event :", event);

  callback(null, event);
}// createEvent


function createDirective(context, event, callback){
  var directive = {};

  directive.event = event;

  if(context === null){
  }else{
    directive.context = context;
  }

  log("directive :", directive);

  callback(null, directive);
}// createDirective


function makeControlResponse(event, responseName, value, callback){
  const correlationToken = event.directive.header.correlationToken;
  const endpoint = event.directive.endpoint;
  var payload = {};

  // Request query
  const deviceId = endpoint.endpointId;

  // Make Alexa response
  async.parallel({
    header: function(callback){
      createHeader(NAMESPACE_ALEXA, NAME_RESPONSE, correlationToken, function(error, header){
        callback(null, header);
      });
    },
    context: function(callback){
      createContext(event, responseName, value, function(error, context){
        callback(null, context);
      });
    }
  }, function(error, results){
    const header = results.header;
    const context = results.context;

    async.waterfall([
      function(callback){
        createEvent(header, endpoint, payload, function(error, event){
          callback(null, event);
        });
      },
      function(event, callback){
        createDirective(context, event, function(error, directive){
          callback(null, directive);
        });
      }
    ], function(error, result){
      callback(null, result);
    });
  });
}


var log = function(title, msg){
  console.log('**** ' + title + ': ' + JSON.stringify(msg));
}// log
