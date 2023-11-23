export const SERVER_URL = process.env.SERVER_URL || 'http://192.168.1.129:6060'

import { extend } from "umi-request";

export const request = extend({
    prefix: SERVER_URL, // Set your default prefix URL here
  });