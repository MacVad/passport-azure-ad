/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

"use strict";

/**
 * How to create SAML Logout signing keys on linux/mac
 * openssl req -x509 -nodes -days 365 -newkey rsa:2048 -sha1 -keyout private.pem -out public.pem
 */

/*
 * certificate string and private key string have the following format:
 * 1. certificate string:
 *    "-----BEGIN CERTIFICATE----- content ----END CERTIFICATE-----"
 * 2. private key string:
 *    "-----BEGIN PRIVATE KEY----- content -----END PRIVATE KEY-----"
 *
 * We define two regex (CERT_REGEX and PRIVATE_KEY_REGEX), in which the content 
 * we are interested in is captured as a (and the only) capture group. We can 
 * then use the getFirstCapturingGroup function below to get the content, and 
 * use the removeRN function below to sanitize the content by removing the \r 
 * and \n's in the content.
 */

/* eslint-disable max-len, no-useless-escape*/
const CERT_REGEX = /-----BEGIN\sCERTIFICATE-----\s+([a-zA-Z0-9+\/=\r\n]+)\s+-----END\sCERTIFICATE-----/;
const PRIVATE_KEY_REGEX = /-----BEGIN\sPRIVATE\sKEY-----\s+([a-zA-Z0-9+\/=\r\n]+)\s+-----END\sPRIVATE\sKEY-----/;
/* eslint-enable max-len, no-useless-escape*/

function getFirstCapturingGroup(str, regex) {
  if (typeof str !== "string") {
    throw new Error(`'str' must be of type "String", actually is ${typeof str}`);
  }
  const matches = str.match(regex);
  /*
   * if str matches the regex (either CERT_REGEX or PRIVATE_KEY_REGEX), then
   * matches will always have two groups:
   * matches[0]: this is always the entire match, in this case, the certificate/key str 
   * matches[1]: this is the first (and the only) group we want to capture in the regex,
   * which is the certifcate/key content
   */
  if (!Array.isArray(matches) || matches.length !== 2) {
    return null;
  }
  return matches[1];
}

function removeRN(str) {
  if (typeof str !== "string") {
    throw new Error(`'str' must be of type "String", actually is ${typeof str}`);
  }
  return str.replace(/[\r\n]/g, "");
}

exports.getCertificate = function getCertificate(pem) {
  return removeRN(getFirstCapturingGroup(pem, CERT_REGEX));
};

exports.getPrivateKey = function getPrivateKey(pem) {
  return removeRN(getFirstCapturingGroup(pem, PRIVATE_KEY_REGEX));
};

exports.certToPEM = function certToPEM(cert) {
  const BEGIN_CERT = "-----BEGIN CERTIFICATE-----";
  const END_CERT = "-----END CERTIFICATE-----";
  return [BEGIN_CERT]
    .concat(cert.match(/.{1,64}/g))
    .concat([END_CERT])
    .join("\n");
};
