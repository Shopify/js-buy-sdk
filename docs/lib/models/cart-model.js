'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _cartLineItemModel = require('./cart-line-item-model');

var _cartLineItemModel2 = _interopRequireDefault(_cartLineItemModel);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _global = require('../metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function objectsEqual(one, two) {
  if (one === two) {
    return true;
  }

  return Object.keys(one).every(function (key) {
    if (one[key] instanceof Date) {
      return one[key].toString() === two[key].toString();
    } else if (_typeof(one[key]) === 'object') {
      return objectsEqual(one[key], two[key]);
    }

    return one[key] === two[key];
  });
}

var CartModel = _baseModel2.default.extend({

  /**
    * Class for cart model
    * @class CartModel
    * @constructor
  */
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * get ID for current cart
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  /**
    * Get current line items for cart
    * @property lineItems
    * @type {Array}
  */
  get lineItems() {
    return (this.attrs.line_items || []).map(function (item) {
      return new _cartLineItemModel2.default(item);
    });
  },

  /**
    * Gets the sum quantity of each line item
    * @property lineItemCount
    * @type {Number}
  */
  get lineItemCount() {
    return this.lineItems.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  },

  /**
    * Get current subtotal price for all line items
    * @property subtotal
    * @type {String}
  */
  get subtotal() {
    var subtotal = this.lineItems.reduce(function (runningTotal, lineItem) {
      return runningTotal + parseFloat(lineItem.line_price);
    }, 0);

    return subtotal.toFixed(2);
  },

  /**
    * Get checkout URL for current cart
    * @property checkoutUrl
    * @type {String}
  */
  get checkoutUrl() {
    var config = this.config;
    var baseUrl = 'https://' + config.domain + '/cart';

    var variantPath = this.lineItems.map(function (item) {
      return item.variant_id + ':' + item.quantity;
    });

    var query = 'api_key=' + config.apiKey;

    if (typeof _global2.default.ga === 'function') {
      var linkerParam = void 0;

      _global2.default.ga(function (tracker) {
        linkerParam = tracker.get('linkerParam');
      });

      if (linkerParam) {
        query += '&' + linkerParam;
      }
    }

    return baseUrl + '/' + variantPath + '?' + query;
  },

  /**
    * Add items to cart. Updates cart's `lineItems`
    * ```javascript
    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method addVariants
    * @param {Object} item - One or more variants
    * @param {Object} item.variant - variant object
    * @param {Number} item.quantity - quantity
    * @param {Object} [nextItem...] - further lineItems may be passed
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  addVariants: function addVariants() {
    var newLineItems = [].concat(Array.prototype.slice.call(arguments)).map(function (item) {
      var lineItem = {
        image: item.variant.image,
        variant_id: item.variant.id,
        product_id: item.variant.productId,
        title: item.variant.productTitle,
        quantity: parseInt(item.quantity, 10),
        properties: item.properties || {},
        variant_title: item.variant.title,
        price: item.variant.price,
        compare_at_price: item.variant.compareAtPrice,
        grams: item.variant.grams
      };

      (0, _setGuidFor2.default)(lineItem);

      return lineItem;
    });
    var existingLineItems = this.attrs.line_items;

    existingLineItems.push.apply(existingLineItems, _toConsumableArray(newLineItems));

    var dedupedLineItems = existingLineItems.reduce(function (itemAcc, item) {
      var matchingItem = itemAcc.filter(function (existingItem) {
        return existingItem.variant_id === item.variant_id && objectsEqual(existingItem.properties, item.properties);
      })[0];

      if (matchingItem) {
        matchingItem.quantity = matchingItem.quantity + item.quantity;
      } else {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    // Users may pass negative numbers and remove items. This ensures there's no
    // item with a quantity of zero or less.
    this.attrs.line_items = dedupedLineItems.reduce(function (itemAcc, item) {
      if (item.quantity >= 1) {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    return this.updateModel();
  },


  /**
    * Update line item quantity
    * ```javascript
    * cart.updateLineItem(123, 2).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method updateLineItem
    * @param {Number} id - line item ID
    * @param {Number} quantity - new quantity for line item
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateLineItem: function updateLineItem(id, quantity) {
    if (quantity < 1) {
      return this.removeLineItem(id);
    }

    var lineItem = this.lineItems.filter(function (item) {
      return item.id === id;
    })[0];

    if (lineItem) {
      lineItem.quantity = quantity;

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove line item from cart
    * @method removeLineItem
    * @param {Number} id - line item ID
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  removeLineItem: function removeLineItem(id) {
    var oldLength = this.lineItems.length;
    var newLineItems = this.lineItems.filter(function (item) {
      return item.id !== id;
    });
    var newLength = newLineItems.length;

    if (newLength < oldLength) {
      this.attrs.line_items = newLineItems.map(function (item) {
        return item.attrs;
      });

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove all line items from cart
    * @method clearLineItems
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  clearLineItems: function clearLineItems() {
    this.attrs.line_items = [];

    return this.updateModel();
  },


  /**
    * force update of cart model on server
    * @method updateModel
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateModel: function updateModel() {
    var _this = this;

    return this.shopClient.update('carts', this).then(function (updateCart) {
      (0, _assign2.default)(_this.attrs, updateCart.attrs);

      return _this;
    });
  }
});

exports.default = CartModel;