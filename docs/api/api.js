YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "CartLineItemModel",
        "CartModel",
        "ImageModel",
        "Logger",
        "ProductModel",
        "ProductOptionModel",
        "ProductVariantModel",
        "ReferenceModel",
        "ShopClient",
        "ShopifyBuy"
    ],
    "modules": [
        "shop-client",
        "shopify",
        "shopify-buy",
        "version"
    ],
    "allModules": [
        {
            "displayName": "shop-client",
            "name": "shop-client"
        },
        {
            "displayName": "shopify",
            "name": "shopify",
            "description": "`ShopifyBuy` only defines one function {{#crossLink \"ShopifyBuy/buildClient\"}}{{/crossLink}} which can\nbe used to build a {{#crossLink \"ShopClient\"}}{{/crossLink}} to query your store using the\nprovided\n{{#crossLink \"ShopifyBuy/buildClient/configAttrs:accessToken\"}}`accessToken`{{/crossLink}},\n{{#crossLink \"ShopifyBuy/buildClient/configAttrs:appId\"}}`appId`{{/crossLink}},\nand {{#crossLink \"ShopifyBuy/buildClient/configAttrs:domain\"}}`domain`{{/crossLink}}."
        },
        {
            "displayName": "shopify-buy",
            "name": "shopify-buy"
        },
        {
            "displayName": "version",
            "name": "version"
        }
    ],
    "elements": []
} };
});