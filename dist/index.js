"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
/**
 * Zadarma API
 * Author: Andrey Sukhodeev, Jannik Zinkl
 * Date: 23.12.2021, Updates: 27.07.2023
 *
 * Description of methods
 * https://zadarma.com/ru/support/api/
 * https://zadarma.com/en/support/api/
 *
 * request() returns data from the response / возвращает data из полученного response
 *
 * @request <Object> request_data
 * @return <Object> response_data
 */
var blueimp_md5_1 = __importDefault(require("blueimp-md5"));
// Helper function to sort object properties
var params_sort = function (obj) {
    var sorted = {};
    Object.keys(obj)
        .sort()
        .forEach(function (key) { return (sorted[key] = obj[key]); });
    return sorted;
};
// Helper function to convert an object to a query string
var buildQueryString = function (params) {
    var queryParts = [];
    for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        queryParts.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
    }
    return queryParts.join('&');
};
var prepare_data_to_request = function prepare_data_to_request(obj) {
    var method = obj.method, params = obj.params, userKey = obj.userKey, secretKey = obj.secretKey;
    var paramsString = buildQueryString(params_sort(params));
    // Generate MD5 hash using blueimp-md5
    var md5Hash = (0, blueimp_md5_1.default)(paramsString);
    var dataToSign = method + paramsString + md5Hash;
    if (secretKey && secretKey.length == 20) {
        // Convert secretKey to CryptoKey
        var encoder = new TextEncoder();
        var keyBuffer = encoder.encode(secretKey);
        var keyPromise = crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: { name: 'SHA-1' } }, // Use SHA-1 here
        false, ['sign']);
        // Generate HMAC-SHA1 hash
        var dataBuffer_1 = encoder.encode(dataToSign);
        return keyPromise
            .then(function (key) { return crypto.subtle.sign('HMAC', key, dataBuffer_1); })
            .then(function (hmacBuffer) {
            var sha1 = Array.from(new Uint8Array(hmacBuffer))
                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                .join('');
            var sign = btoa(sha1);
            return {
                headers: { Authorization: "".concat(userKey, ":").concat(sign) },
                paramsString: paramsString,
            };
        })
            .catch(function (error) {
            throw new Error("zadarma: ".concat(error));
        });
    }
    throw new Error('zadarma: api secret key is not set!!!');
};
var api = function request(obj) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, baseURL, _b, api_method, _c, params, _d, http_method, _e, api_user_key, _f, api_secret_key, _g, headers, paramsString;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _a = obj.baseURL, baseURL = _a === void 0 ? 'https://api.zadarma.com' : _a, _b = obj.api_method, api_method = _b === void 0 ? '' : _b, _c = obj.params, params = _c === void 0 ? {} : _c, _d = obj.http_method, http_method = _d === void 0 ? 'GET' : _d, _e = obj.api_user_key, api_user_key = _e === void 0 ? process.env.NEXT_PUBLIC_ZADARMA_USER_KEY : _e, _f = obj.api_secret_key, api_secret_key = _f === void 0 ? process.env.NEXT_PUBLIC_ZADARMA_SECRET_KEY : _f;
                    if (api_method === '') {
                        console.error('zadarma: api_method is empty!!!');
                    }
                    return [4 /*yield*/, prepare_data_to_request({
                            method: api_method,
                            params: params,
                            userKey: api_user_key,
                            secretKey: api_secret_key,
                        })];
                case 1:
                    _g = _h.sent(), headers = _g.headers, paramsString = _g.paramsString;
                    return [2 /*return*/, new Promise(function (resolve) {
                            fetch("".concat(baseURL).concat(http_method === 'GET' ? "".concat(api_method, "?").concat(paramsString) : api_method), {
                                method: http_method,
                                headers: headers,
                                body: http_method !== 'GET' ? paramsString : undefined,
                            })
                                .then(function (response) {
                                resolve(response.json());
                            })
                                .catch(function (error) {
                                resolve(error);
                            });
                        })];
            }
        });
    });
};
exports.api = api;
