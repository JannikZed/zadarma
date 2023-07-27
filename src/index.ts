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
import md5 from 'blueimp-md5';

// Helper function to sort object properties
const params_sort = function (obj: { [x: string]: any }) {
  let sorted: { [x: string]: any } = {};
  Object.keys(obj)
    .sort()
    .forEach((key: string) => (sorted[key] = obj[key]));
  return sorted;
};

// Helper function to convert an object to a query string
const buildQueryString = (params: { [x: string]: any }): string => {
  const queryParts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return queryParts.join('&');
};

const prepare_data_to_request = function prepare_data_to_request(
  obj: {
    method: any;
    params: any;
    userKey: any;
    secretKey: any;
  }
) {
  let { method, params, userKey, secretKey } = obj;

  let paramsString = buildQueryString(params_sort(params));

  // Generate MD5 hash using blueimp-md5
  const md5Hash = md5(paramsString);

  let dataToSign = method + paramsString + md5Hash;

  if (secretKey && secretKey.length == 20) {
    // Convert secretKey to CryptoKey
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(secretKey);
    const keyPromise = crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: { name: 'SHA-1' } }, // Use SHA-1 here
      false,
      ['sign']
    );

    // Generate HMAC-SHA1 hash
    const dataBuffer = encoder.encode(dataToSign);

    return keyPromise
      .then((key) => crypto.subtle.sign('HMAC', key, dataBuffer))
      .then((hmacBuffer) => {
        const sha1 = Array.from(new Uint8Array(hmacBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const sign = btoa(sha1);

        return {
          headers: { Authorization: `${userKey}:${sign}` },
          paramsString: paramsString,
        };
      })
      .catch((error) => {
        throw new Error(`zadarma: ${error}`);
      });
  }
  throw new Error('zadarma: api secret key is not set!!!');
};

const api = async function request(obj: {
  baseURL?: string | undefined;
  api_method?: string | undefined;
  params?: {} | undefined;
  http_method?: string | undefined;
  api_user_key?: string | undefined;
  api_secret_key?: string | undefined;
  timeout?: number | undefined;
}) {
  let {
    baseURL = 'https://api.zadarma.com',
    api_method = '',
    params = {},
    http_method = 'GET', // GET || POST || PUT || DELETE
    api_user_key = process.env.NEXT_PUBLIC_ZADARMA_USER_KEY,
    api_secret_key = process.env.NEXT_PUBLIC_ZADARMA_SECRET_KEY,
    // timeout = 0, // number of milliseconds
  } = obj;

  if (api_method === '') {
    console.error('zadarma: api_method is empty!!!');
  }

  let { headers, paramsString } = await prepare_data_to_request({
    method: api_method,
    params: params,
    userKey: api_user_key,
    secretKey: api_secret_key,
  });

  return new Promise((resolve) => {
    fetch(
      `${baseURL}${
        http_method === 'GET' ? `${api_method}?${paramsString}` : api_method
      }`,
      {
        method: http_method,
        headers: headers,
        body: http_method !== 'GET' ? paramsString : undefined,
      }
    )
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

export { api };
