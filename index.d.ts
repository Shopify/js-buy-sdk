// Type definitions for shopify-buy 2.10
// Project: https://github.com/Shopify/js-buy-sdk#readme
// Definitions by: Martin Köhn <https://github.com/openminder>
//                 Stephen Traiforos <https://github.com/straiforos>
//                 Juan Manuel Incaurgarat <https://github.com/kilinkis>
//                 Chris Worman <https://github.com/chrisworman-pela>
//                 Maciej Baron <https://github.com/MaciekBaron>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.7

/**
 * The JS Buy SDK is a lightweight library that allows you to build ecommerce into any website.
 * It is based on Shopify’s API and provides the ability to retrieve products and collections from
 * your shop, add products to a cart, and checkout. It can render data on the client side or
 * server. This will allow you to add ecommerce functionality to any website or javascript
 * application. This is helpful if you already have a website and need to add ecommerce or only
 * need a simple buy button on your site.
 */

declare namespace ShopifyBuy {
    export function buildClient(config: Config): Client;

    export interface Client {
        product: ShopifyBuy.ProductResource;
        collection: ShopifyBuy.CollectionResource;
        checkout: ShopifyBuy.CheckoutResource;
        shop: ShopifyBuy.ShopResource;
        image: ShopifyBuy.ImageResource;
        fetchNextPage<T extends GraphModel>(nextArray: T[]): T[];
    }

    export interface Config {
        domain: string;
        storefrontAccessToken: string;
        language?: string | undefined;
    }

    export interface ProductResource {
        fetch(id: string): Promise<Product>;
        fetchAll(pageSizeopt?: number): Promise<Product[]>;
        fetchByHandle(handle: string): Promise<Product>;
        fetchMultiple(ids: string[]): Promise<Product[]>;
        fetchQuery(query: Query): Promise<Product[]>;

        helpers: ProductHelpers;
    }

    export interface ProductHelpers {
        /**
         *   Product Helper Namespace
         *   @link https://shopify.github.io/js-buy-sdk/ProductResource.html
         */
        variantForOptions(product: Product, options: {[optionName: string]: string}): ProductVariant;
    }

    export interface CollectionResource {
        fetch(id: string): Promise<Product[]>;
        fetchWithProducts(id: string, options?: {productsFirst: number}): Promise<any[]>;
        fetchWithProductsForCollectionView(id, options?: {productsFirst: number}): Promise<any[]>;
        fetchAll(options?: {first: number, productsFirst: number}): Promise<any[]>;
        fetchAllWithProducts(): Promise<any[]>; // TODO fix to be a type: DOC: Fetches all collections on the shop, including products.
        fetchByHandle(handle: string): Promise<any[]>; // TODO fix to be a type: DOC: Fetches a collection by handle on the shop. Assuming it does not give products
        fetchQuery(query: Query): Promise<any[]>; // TODO fix to be a type: DOC: Fetches a collection by handle on the shop. Assuming it does not give products
    }

    export interface CheckoutResource {
        create(
            email?: string,
            lineItems?: LineItem[],
            shippingAddress?: Address,
            note?: string,
            customAttributes?: AttributeInput[],
        ): Promise<Cart>;

        fetch(id: string): Promise<Cart>;

        addLineItems(checkoutId: string | number, lineItems: LineItemToAdd[]): Promise<Cart>;

        /**
         * Remove all line items from cart
         */
        clearLineItems(checkoutId: string | number, lineItems: LineItem[]): Promise<Cart>;

        /**
         * Add items to cart. Updates cart's lineItems
         */
        addVariants(item: Item, nextItem?: Array<Item>): Promise<Cart>;

        /**
         * Remove a line item from cart based on line item id
         */
        removeLineItems(checkoutId: string | number, lineItemIds: string[]): Promise<Cart>;

        /**
         * Add discount to cart
         */
        addDiscount(checkoutId: string | number, discountCode: string): Promise<Cart>;

        /**
         * Remove discounts from cart
         */
        removeDiscount(checkoutId: string | number): Promise<Cart>;

        /**
         * Update line item quantities based on an array of line item ids
         */
        updateLineItems(checkoutId: string | number, lineItems: LineItemToUpdate[]): Promise<Cart>;
    }

    export interface ShopResource {
        fetchInfo(): Promise<Shop>;
        fetchPolicies(): Promise<Shop>;
    }

    export interface ImageResource {
        helpers: ImageHelpers;
    }

    export interface ImageHelpers {
        /**
         * Returns src URL for new image size/variant
         * @param image The image you would like a different size for.
         * @param options Image Max width and height configuration.
         */
        imageForSize(image: Image, options: ImageOptions): string;
    }

    export interface Query {
        /**
         * query: title, collection_type, updated_at
         * TODO probably will remove before Defintely Typed PR,
         * as their  community guidelines
         */
        query: string;
        sortKey: string;
        after?: string | undefined;
        before?: string | undefined;
        first?: number | undefined;
        last?: number | undefined;
        reverse?: boolean | undefined;
    }

    export type CurrencyCode = "GBP" | "EUR" | "USD" | "CAD";

    export interface MoneyV2 {
        amount: number | string;
        currencyCode: CurrencyCode;
    }

    export interface Product extends GraphModel {
        /**
         * A product description.
         */
        description: string;

        /**
         * The HTML-serialized version of the product description.
         */
        descriptionHtml: string;

        /**
         * Product unique ID
         */
        id: string | number;

        /**
         * An Array of Objects that contain meta data about an image including src of the images.
         */
        images: Array<Image>;

        /**
         * All variants of a product.
         */
        variants: Array<ProductVariant>;

        /**
         * Get an array of Product Options. Product Options can be used to define
         * the currently selectedVariant from which you can get a checkout url
         * (ProductVariant.checkoutUrl) or can be added to a cart
         * (Cart.createLineItemsFromVariants).
         */
        options: Array<ProductOption>;

        /**
         * Retrieve variant for currently selected options. By default the first value in each
         * option is selected which means selectedVariant will never be null. With a
         * selectedVariant you can create checkout url (ProductVariant.checkoutUrl) or it can be
         * added to a cart (Cart.createLineItemsFromVariants).
         */
        selectedVariant: ProductVariant;

        /**
         * Retrieve image for currently selected variantImage.
         */
        selectedVariantImage: Image;

        /**
         * A read only Array of Strings represented currently selected option values. eg. ["Large",
         * "Red"]
         */
        selections: Array<string>;

        /**
         * The product title
         */
        title: string;

        /**
         * The product’s vendor name
         */
        vendor: string;

        /**
         * The product's tags.
         */
        tags: Scalar[];

        /**
         * The product's custom metafields.
         */
        metafields: Array<Metafield | null>

        /**
         * The sellable quantity of the product.
         */
        quantity: number;
    }

    export interface ProductVariant extends GraphModel {
        /**
         * Variant in stock. Always true if inventory tracking is disabled.
         */
        available: boolean;

        /**
         * Compare at price for variant. The compareAtPrice would be the price of the
         * product previously before the product went on sale.
         */
        compareAtPrice: MoneyV2 | null;

        /**
         *  Indicates whether the variant is out of stock but still available for purchase (used
         *  for backorders).
         */
        currentlyNotInStock: boolean;

        /**
         * Variant unique ID
         */
        id: string | number;

        /**
         * Image for variant
         */

        image: Image;

        /**
         * Price of the variant.
         */
        price: MoneyV2;

        /**
         * A limited reference to the variant's product.
         */
        product: ProductWithinVariant;

        /**
         * Selected options.
         */
        selectedOptions: SelectedOption[];

        /**
         * Title of variant
         */
        title: string;

        /**
         * The variant's custom metafields.
         */
        metafields: Array<Metafield | null>;

        /**
         * The sellable quantity of the variant.
         */
        quantity: number;
    }

    export interface ProductOption {
        /**
         * The name of option (ex. "Size", "Color").
         */
        name: string;

        /**
         * The list of possible values for the option.
         */
        values: Array<Scalar>;
    }

    export interface CustomAttribute {
        key: string;
        value: string;
    }

    export interface CustomAttributeV2 {
        customAttributes: {
            key: string;
            value: string;
        }[];
    }

    export interface Collection {
        handle: string;
        body_html: string;
        image: Image;
        id: string;
        metafields: any[];
        published: boolean;
        published_at: string;
        published_scope: string;
        sort_order: string;
        template_suffix: string;
        title: string;
        updated_at: string;
    }

    export interface Cart extends GraphModel {

        /**
         * get ID for current cart
         */
        id: string | number;

        /**
         * Get an Array of CartLineItemModel's
         */
        lineItems: LineItem[];

        /**
         * Get current subtotal price for all line items, before shipping, taxes, and discounts.
         * Example: two items have been added to the cart that cost $1.25 then the subtotal will be
         * 2.50
         */
        subtotalPrice: MoneyV2;

        /**
         * Get completed at date.
         */
        completedAt: string | null;

        /**
         * Get checkout url
         */
        webUrl: string;
    }

    export interface LineItem extends GraphModel {
        /**
         * A line item ID in the form of gid://shopify/CheckoutLineItem/:legacyResourceId.
         */
        id: string | number;

        /**
         * Count of variants to order.
         */
        quantity: number;

        /**
         * Product title of variant's parent product.
         */
        title: string;

        /**
         * Variant of the line item that also includes a reference back to its parent product.
         */
        variant: ProductVariant & {product: ProductWithinVariant};

        /**
         * Custom attributes of a line item.
         */
        customAttributes: CustomAttribute[];
    }

    export interface LineItemToAdd {
        variantId: string | number;
        quantity: number;
        customAttributes?: CustomAttribute[];
    }

    export interface LineItemToUpdate {
        /* Identifier of the line item. */
        id: string | number;
        quantity: number;
        customAttributes?: CustomAttribute[];
    }

    export interface Item {
        variant: ProductVariant;
        quantity: number;
    }

    export interface Address {
        address1: String;
        address2: String;
        city: String;
        company: String;
        country: String;
        firstName: String;
        lastName: String;
        phone: String;
        province: String;
        zip: String;
    }

    /**
     *  https://help.shopify.com/api/custom-storefronts/storefront-api/reference/input_object/attributeinput
     * https://help.shopify.com/api/custom-storefronts/storefront-api/reference/input_object/checkoutlineitemupdateinput
     */
    export interface AttributeInput {
        key?: string | undefined;
        value?: string | undefined;
        id?: string | number | undefined;
        quantity?: number | undefined;
        variantId?: string | undefined;
    }

    /**
     * TODO Validate schema matches js-buy
     * Derived from REST API Docs:
     * https://help.shopify.com/api/custom-storefronts/storefront-api/reference/object/shop#fields
     */
    export interface Shop {
        description: string;
        moneyFormat: string;
        name: string;
        /**
         * TODO Add types for the Shop properties below
         * PaymentSettings, ShopPolicy etc
         */
        paymentSettings: any;
        primaryDomain: any;
        privacyPolicy: any;
        refundPolicy: any;
        termsOfService: any;
    }

    /**
     * Internal Image description
     */
    export interface Image extends GraphModel {
        id: string | number;
        height: number;
        width: number;
        src: string;
        altText: string;
    }

    export interface ImageVariant extends Image {
        name: string;
        dimensions: string;
        src: string;
    }

    export interface SelectedOption {
        name: string;
        value: string;
    }

    export interface ImageOptions {
        maxWidth: number;
        maxHeight: number;
    }

    let NO_IMAGE_URI: string;

    /*
     *   Base Model for the higher level returned objects from the API using GraphQL
     */
    export interface GraphModel {
        attrs?: any;
        onlineStoreUrl?: string | undefined;
    }

    /**
     * A subset of a product object that only includes the id, title, and metafields. This
     * exists in variants, so that they each have a reference back to their parent product node.
     */
    export interface ProductWithinVariant extends Pick<Product, "title" | "id" | "metafields">{}

    export interface Scalar {
        value: string;
    }

    export interface MetafieldReference {
        id: string;
        fields?: MetaobjectField[];
        image?: {
            originalSrc: string;
        };
    }

    export interface MetaobjectField {
        id: string;
        key: string;
        type: string;
        value: string;
        reference: MetafieldReference | null;
    }

    export interface Metafield extends MetaobjectField {
        namespace: string;
    }
}

declare module '@hellojuniper-com/shopify-buy' {
    export = ShopifyBuy;
}