import Config from './config';
import ShopClient from './shop-client';
import CoreObject from 'buy-button-sdk/metal/core-object';
import assign from 'buy-button-sdk/metal/assign';

const Shopify = new CoreObject();

assign(Shopify, {
  ShopClient,
  Config
});

export default Shopify;
