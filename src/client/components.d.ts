/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Announce, AnnounceAndMeta, PostJSON } from "../shared";
import { PromiseState, RouteMatch } from "../shared-web";
import { Icons } from "../shared-web/components/ap-icon/ap-icon";
import { App } from "./app/app";
export namespace Components {
    interface ApAnnounce {
        "announce": AnnounceAndMeta;
        "href"?: string;
        "iconImgPromise"?: PromiseState<string>;
        "icons"?: {
    follow: boolean;
    notification: boolean;
  };
        "showDetails"?: boolean;
    }
    interface ApCheckbox {
        "checked"?: boolean;
        "label"?: string;
    }
    interface ApError {
        "msgs": {
    main: string;
    close: string;
    showErrors: string;
    datetime: (d: number) => string;
  };
        "repo": string;
        "showError": (error: any) => Promise<void>;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApLoading {
    }
    interface ApModal {
    }
    interface ApPost {
        "imgHref"?: string;
        "imgPromise"?: PromiseState<string>;
        "imgs"?: { srcPromise: PromiseState<string>; href?: string }[];
        "msgs": {
    datetime: (v: number) => string;
  };
        "post": PostJSON;
        "showTweet"?: boolean;
        "showYoutube"?: boolean;
    }
    interface ApPosts {
        "hrefFormat"?: string;
        "msgs": {
    datetime: (d: number) => string;
    dataError: string;
  };
        "posts": Announce['posts'];
        "postsPromises": Record<string, PromiseState<PostJSON>>;
    }
    interface ApRoot {
        "componentProps"?: { [k: string]: any };
        "defaultPath": string;
        "redirect"?: (p: string) => string | undefined;
        "routeMatches": RouteMatch[];
    }
    interface ApSpinner {
    }
    interface ApStyle {
    }
    interface ApTextview {
        "text"?: string;
    }
    interface ApTwitter {
        "tweetID"?: string;
    }
    interface ApYoutube {
        "youtubeID"?: string;
    }
    interface AppAbout {
        "activePage": boolean;
        "app": App;
    }
    interface AppAnnounce {
        "activePage": boolean;
        "announceID": string;
        "app": App;
    }
    interface AppAnnounceConfig {
        "activePage": boolean;
        "announceID": string;
        "app": App;
    }
    interface AppConfig {
        "activePage": boolean;
        "app": App;
    }
    interface AppHome {
        "activePage": boolean;
        "app": App;
    }
    interface AppImage {
        "announceID": string;
        "app": App;
        "image62"?: string;
        "imageID"?: string;
        "postID": string;
    }
    interface AppPost {
        "activePage": boolean;
        "announceID": string;
        "app": App;
        "postID": string;
    }
    interface AppRoot {
    }
}
declare global {
    interface HTMLApAnnounceElement extends Components.ApAnnounce, HTMLStencilElement {
    }
    var HTMLApAnnounceElement: {
        prototype: HTMLApAnnounceElement;
        new (): HTMLApAnnounceElement;
    };
    interface HTMLApCheckboxElement extends Components.ApCheckbox, HTMLStencilElement {
    }
    var HTMLApCheckboxElement: {
        prototype: HTMLApCheckboxElement;
        new (): HTMLApCheckboxElement;
    };
    interface HTMLApErrorElement extends Components.ApError, HTMLStencilElement {
    }
    var HTMLApErrorElement: {
        prototype: HTMLApErrorElement;
        new (): HTMLApErrorElement;
    };
    interface HTMLApIconElement extends Components.ApIcon, HTMLStencilElement {
    }
    var HTMLApIconElement: {
        prototype: HTMLApIconElement;
        new (): HTMLApIconElement;
    };
    interface HTMLApImageElement extends Components.ApImage, HTMLStencilElement {
    }
    var HTMLApImageElement: {
        prototype: HTMLApImageElement;
        new (): HTMLApImageElement;
    };
    interface HTMLApLoadingElement extends Components.ApLoading, HTMLStencilElement {
    }
    var HTMLApLoadingElement: {
        prototype: HTMLApLoadingElement;
        new (): HTMLApLoadingElement;
    };
    interface HTMLApModalElement extends Components.ApModal, HTMLStencilElement {
    }
    var HTMLApModalElement: {
        prototype: HTMLApModalElement;
        new (): HTMLApModalElement;
    };
    interface HTMLApPostElement extends Components.ApPost, HTMLStencilElement {
    }
    var HTMLApPostElement: {
        prototype: HTMLApPostElement;
        new (): HTMLApPostElement;
    };
    interface HTMLApPostsElement extends Components.ApPosts, HTMLStencilElement {
    }
    var HTMLApPostsElement: {
        prototype: HTMLApPostsElement;
        new (): HTMLApPostsElement;
    };
    interface HTMLApRootElement extends Components.ApRoot, HTMLStencilElement {
    }
    var HTMLApRootElement: {
        prototype: HTMLApRootElement;
        new (): HTMLApRootElement;
    };
    interface HTMLApSpinnerElement extends Components.ApSpinner, HTMLStencilElement {
    }
    var HTMLApSpinnerElement: {
        prototype: HTMLApSpinnerElement;
        new (): HTMLApSpinnerElement;
    };
    interface HTMLApStyleElement extends Components.ApStyle, HTMLStencilElement {
    }
    var HTMLApStyleElement: {
        prototype: HTMLApStyleElement;
        new (): HTMLApStyleElement;
    };
    interface HTMLApTextviewElement extends Components.ApTextview, HTMLStencilElement {
    }
    var HTMLApTextviewElement: {
        prototype: HTMLApTextviewElement;
        new (): HTMLApTextviewElement;
    };
    interface HTMLApTwitterElement extends Components.ApTwitter, HTMLStencilElement {
    }
    var HTMLApTwitterElement: {
        prototype: HTMLApTwitterElement;
        new (): HTMLApTwitterElement;
    };
    interface HTMLApYoutubeElement extends Components.ApYoutube, HTMLStencilElement {
    }
    var HTMLApYoutubeElement: {
        prototype: HTMLApYoutubeElement;
        new (): HTMLApYoutubeElement;
    };
    interface HTMLAppAboutElement extends Components.AppAbout, HTMLStencilElement {
    }
    var HTMLAppAboutElement: {
        prototype: HTMLAppAboutElement;
        new (): HTMLAppAboutElement;
    };
    interface HTMLAppAnnounceElement extends Components.AppAnnounce, HTMLStencilElement {
    }
    var HTMLAppAnnounceElement: {
        prototype: HTMLAppAnnounceElement;
        new (): HTMLAppAnnounceElement;
    };
    interface HTMLAppAnnounceConfigElement extends Components.AppAnnounceConfig, HTMLStencilElement {
    }
    var HTMLAppAnnounceConfigElement: {
        prototype: HTMLAppAnnounceConfigElement;
        new (): HTMLAppAnnounceConfigElement;
    };
    interface HTMLAppConfigElement extends Components.AppConfig, HTMLStencilElement {
    }
    var HTMLAppConfigElement: {
        prototype: HTMLAppConfigElement;
        new (): HTMLAppConfigElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppImageElement extends Components.AppImage, HTMLStencilElement {
    }
    var HTMLAppImageElement: {
        prototype: HTMLAppImageElement;
        new (): HTMLAppImageElement;
    };
    interface HTMLAppPostElement extends Components.AppPost, HTMLStencilElement {
    }
    var HTMLAppPostElement: {
        prototype: HTMLAppPostElement;
        new (): HTMLAppPostElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLElementTagNameMap {
        "ap-announce": HTMLApAnnounceElement;
        "ap-checkbox": HTMLApCheckboxElement;
        "ap-error": HTMLApErrorElement;
        "ap-icon": HTMLApIconElement;
        "ap-image": HTMLApImageElement;
        "ap-loading": HTMLApLoadingElement;
        "ap-modal": HTMLApModalElement;
        "ap-post": HTMLApPostElement;
        "ap-posts": HTMLApPostsElement;
        "ap-root": HTMLApRootElement;
        "ap-spinner": HTMLApSpinnerElement;
        "ap-style": HTMLApStyleElement;
        "ap-textview": HTMLApTextviewElement;
        "ap-twitter": HTMLApTwitterElement;
        "ap-youtube": HTMLApYoutubeElement;
        "app-about": HTMLAppAboutElement;
        "app-announce": HTMLAppAnnounceElement;
        "app-announce-config": HTMLAppAnnounceConfigElement;
        "app-config": HTMLAppConfigElement;
        "app-home": HTMLAppHomeElement;
        "app-image": HTMLAppImageElement;
        "app-post": HTMLAppPostElement;
        "app-root": HTMLAppRootElement;
    }
}
declare namespace LocalJSX {
    interface ApAnnounce {
        "announce": AnnounceAndMeta;
        "href"?: string;
        "iconImgPromise"?: PromiseState<string>;
        "icons"?: {
    follow: boolean;
    notification: boolean;
  };
        "showDetails"?: boolean;
    }
    interface ApCheckbox {
        "checked"?: boolean;
        "label"?: string;
    }
    interface ApError {
        "msgs"?: {
    main: string;
    close: string;
    showErrors: string;
    datetime: (d: number) => string;
  };
        "repo": string;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApLoading {
    }
    interface ApModal {
        "onClose"?: (event: CustomEvent<any>) => void;
    }
    interface ApPost {
        "imgHref"?: string;
        "imgPromise"?: PromiseState<string>;
        "imgs"?: { srcPromise: PromiseState<string>; href?: string }[];
        "msgs": {
    datetime: (v: number) => string;
  };
        "post": PostJSON;
        "showTweet"?: boolean;
        "showYoutube"?: boolean;
    }
    interface ApPosts {
        "hrefFormat"?: string;
        "msgs": {
    datetime: (d: number) => string;
    dataError: string;
  };
        "posts": Announce['posts'];
        "postsPromises": Record<string, PromiseState<PostJSON>>;
    }
    interface ApRoot {
        "componentProps"?: { [k: string]: any };
        "defaultPath"?: string;
        "redirect"?: (p: string) => string | undefined;
        "routeMatches": RouteMatch[];
    }
    interface ApSpinner {
    }
    interface ApStyle {
    }
    interface ApTextview {
        "text"?: string;
    }
    interface ApTwitter {
        "tweetID"?: string;
    }
    interface ApYoutube {
        "youtubeID"?: string;
    }
    interface AppAbout {
        "activePage": boolean;
        "app": App;
    }
    interface AppAnnounce {
        "activePage": boolean;
        "announceID": string;
        "app": App;
    }
    interface AppAnnounceConfig {
        "activePage": boolean;
        "announceID": string;
        "app": App;
    }
    interface AppConfig {
        "activePage": boolean;
        "app": App;
    }
    interface AppHome {
        "activePage": boolean;
        "app": App;
    }
    interface AppImage {
        "announceID": string;
        "app": App;
        "image62"?: string;
        "imageID"?: string;
        "postID": string;
    }
    interface AppPost {
        "activePage": boolean;
        "announceID": string;
        "app": App;
        "postID": string;
    }
    interface AppRoot {
    }
    interface IntrinsicElements {
        "ap-announce": ApAnnounce;
        "ap-checkbox": ApCheckbox;
        "ap-error": ApError;
        "ap-icon": ApIcon;
        "ap-image": ApImage;
        "ap-loading": ApLoading;
        "ap-modal": ApModal;
        "ap-post": ApPost;
        "ap-posts": ApPosts;
        "ap-root": ApRoot;
        "ap-spinner": ApSpinner;
        "ap-style": ApStyle;
        "ap-textview": ApTextview;
        "ap-twitter": ApTwitter;
        "ap-youtube": ApYoutube;
        "app-about": AppAbout;
        "app-announce": AppAnnounce;
        "app-announce-config": AppAnnounceConfig;
        "app-config": AppConfig;
        "app-home": AppHome;
        "app-image": AppImage;
        "app-post": AppPost;
        "app-root": AppRoot;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "ap-announce": LocalJSX.ApAnnounce & JSXBase.HTMLAttributes<HTMLApAnnounceElement>;
            "ap-checkbox": LocalJSX.ApCheckbox & JSXBase.HTMLAttributes<HTMLApCheckboxElement>;
            "ap-error": LocalJSX.ApError & JSXBase.HTMLAttributes<HTMLApErrorElement>;
            "ap-icon": LocalJSX.ApIcon & JSXBase.HTMLAttributes<HTMLApIconElement>;
            "ap-image": LocalJSX.ApImage & JSXBase.HTMLAttributes<HTMLApImageElement>;
            "ap-loading": LocalJSX.ApLoading & JSXBase.HTMLAttributes<HTMLApLoadingElement>;
            "ap-modal": LocalJSX.ApModal & JSXBase.HTMLAttributes<HTMLApModalElement>;
            "ap-post": LocalJSX.ApPost & JSXBase.HTMLAttributes<HTMLApPostElement>;
            "ap-posts": LocalJSX.ApPosts & JSXBase.HTMLAttributes<HTMLApPostsElement>;
            "ap-root": LocalJSX.ApRoot & JSXBase.HTMLAttributes<HTMLApRootElement>;
            "ap-spinner": LocalJSX.ApSpinner & JSXBase.HTMLAttributes<HTMLApSpinnerElement>;
            "ap-style": LocalJSX.ApStyle & JSXBase.HTMLAttributes<HTMLApStyleElement>;
            "ap-textview": LocalJSX.ApTextview & JSXBase.HTMLAttributes<HTMLApTextviewElement>;
            "ap-twitter": LocalJSX.ApTwitter & JSXBase.HTMLAttributes<HTMLApTwitterElement>;
            "ap-youtube": LocalJSX.ApYoutube & JSXBase.HTMLAttributes<HTMLApYoutubeElement>;
            "app-about": LocalJSX.AppAbout & JSXBase.HTMLAttributes<HTMLAppAboutElement>;
            "app-announce": LocalJSX.AppAnnounce & JSXBase.HTMLAttributes<HTMLAppAnnounceElement>;
            "app-announce-config": LocalJSX.AppAnnounceConfig & JSXBase.HTMLAttributes<HTMLAppAnnounceConfigElement>;
            "app-config": LocalJSX.AppConfig & JSXBase.HTMLAttributes<HTMLAppConfigElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-image": LocalJSX.AppImage & JSXBase.HTMLAttributes<HTMLAppImageElement>;
            "app-post": LocalJSX.AppPost & JSXBase.HTMLAttributes<HTMLAppPostElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
        }
    }
}
