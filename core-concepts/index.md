---
layout: default
---
# Core Concepts

The Shopify JavaScript Buy SDK uses the Shopify API to connect to your shop, and is based
on the same core concepts.

## Products and Variants

Every item you sell on your Shopify store is a product or a variant of a product.

Sometimes the same product is available in different styles or types. For example, you might sell a t-shirt in a number of different sizes, or a hat in a variety of different colors. Each distinct version of a product is a variant and has a variant ID. For example, a large blue shirt would have a different variant ID than a small blue shirt.

Whether or not your product has multiple variants, you will still be primarily interacting with variants when working with the SDK. For example, you add a _variant_ of a product to a cart.

## Options

Options are single properties that can be set to one of many values. For example, you could have a "Color" option with the values "Red", "Blue", and "Green". An option is not the same as a variant: a variant could be determined by multiple options, for example, size, color, and fabric. There is one variant ID associated with every possible combination of options for your product. For example, Red, Large, Cotton is one variant, Green, Large, Denim is another variant.  

## Collections

Collections group products together. If a product belongs to a collection, it will have a collection ID. You can find products that belong to a collection by querying by collection ID.
