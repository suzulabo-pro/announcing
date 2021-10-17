/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Announce, AnnounceAndMeta, PostJSON } from "../shared";
import { ApNaviLink, PromiseState, RouteMatch } from "../shared-web";
import { Icons } from "../shared-web/components/ap-icon/ap-icon";
import { PageRenderData } from "../shared-web/datatypes";
import { App } from "./app/app";
import { PageVisible } from "./shared";
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
    }
    interface ApHead {
        "pageTitle"?: string;
        "writeHead": () => Promise<void>;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApImageInput {
        "border"?: boolean;
        "data"?: string;
        "label"?: string;
        "resizeRect": { width: number; height: number };
    }
    interface ApInput {
        "label"?: string;
        "maxLength"?: number;
        "textarea"?: boolean;
        "value"?: string;
    }
    interface ApLoading {
    }
    interface ApModal {
    }
    interface ApNavi {
        "links": ApNaviLink[];
        "position": 'fixed' | 'sticky';
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
    interface AppAbout {
        "app": App;
    }
    interface AppAnnounce {
        "announceID": string;
        "app": App;
        "pageVisible": PageVisible;
    }
    interface AppAnnounceCreate {
        "app": App;
    }
    interface AppAnnounceEdit {
        "announceID": string;
        "app": App;
    }
    interface AppHome {
        "app": App;
        "pageVisible": PageVisible;
    }
    interface AppImportPosts {
        "announceID": string;
        "app": App;
    }
    interface AppPost {
        "announceID": string;
        "app": App;
        "pageVisible": PageVisible;
        "postID": string;
    }
    interface AppPostForm {
        "announceID": string;
        "app": App;
        "postID"?: string;
    }
    interface AppRoot {
    }
    interface AppSignin {
        "app": App;
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
    interface HTMLApHeadElement extends Components.ApHead, HTMLStencilElement {
    }
    var HTMLApHeadElement: {
        prototype: HTMLApHeadElement;
        new (): HTMLApHeadElement;
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
    interface HTMLApImageInputElement extends Components.ApImageInput, HTMLStencilElement {
    }
    var HTMLApImageInputElement: {
        prototype: HTMLApImageInputElement;
        new (): HTMLApImageInputElement;
    };
    interface HTMLApInputElement extends Components.ApInput, HTMLStencilElement {
    }
    var HTMLApInputElement: {
        prototype: HTMLApInputElement;
        new (): HTMLApInputElement;
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
    interface HTMLApNaviElement extends Components.ApNavi, HTMLStencilElement {
    }
    var HTMLApNaviElement: {
        prototype: HTMLApNaviElement;
        new (): HTMLApNaviElement;
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
    interface HTMLAppAnnounceCreateElement extends Components.AppAnnounceCreate, HTMLStencilElement {
    }
    var HTMLAppAnnounceCreateElement: {
        prototype: HTMLAppAnnounceCreateElement;
        new (): HTMLAppAnnounceCreateElement;
    };
    interface HTMLAppAnnounceEditElement extends Components.AppAnnounceEdit, HTMLStencilElement {
    }
    var HTMLAppAnnounceEditElement: {
        prototype: HTMLAppAnnounceEditElement;
        new (): HTMLAppAnnounceEditElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppImportPostsElement extends Components.AppImportPosts, HTMLStencilElement {
    }
    var HTMLAppImportPostsElement: {
        prototype: HTMLAppImportPostsElement;
        new (): HTMLAppImportPostsElement;
    };
    interface HTMLAppPostElement extends Components.AppPost, HTMLStencilElement {
    }
    var HTMLAppPostElement: {
        prototype: HTMLAppPostElement;
        new (): HTMLAppPostElement;
    };
    interface HTMLAppPostFormElement extends Components.AppPostForm, HTMLStencilElement {
    }
    var HTMLAppPostFormElement: {
        prototype: HTMLAppPostFormElement;
        new (): HTMLAppPostFormElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppSigninElement extends Components.AppSignin, HTMLStencilElement {
    }
    var HTMLAppSigninElement: {
        prototype: HTMLAppSigninElement;
        new (): HTMLAppSigninElement;
    };
    interface HTMLElementTagNameMap {
        "ap-announce": HTMLApAnnounceElement;
        "ap-checkbox": HTMLApCheckboxElement;
        "ap-error": HTMLApErrorElement;
        "ap-head": HTMLApHeadElement;
        "ap-icon": HTMLApIconElement;
        "ap-image": HTMLApImageElement;
        "ap-image-input": HTMLApImageInputElement;
        "ap-input": HTMLApInputElement;
        "ap-loading": HTMLApLoadingElement;
        "ap-modal": HTMLApModalElement;
        "ap-navi": HTMLApNaviElement;
        "ap-post": HTMLApPostElement;
        "ap-posts": HTMLApPostsElement;
        "ap-root": HTMLApRootElement;
        "ap-spinner": HTMLApSpinnerElement;
        "ap-style": HTMLApStyleElement;
        "ap-textview": HTMLApTextviewElement;
        "app-about": HTMLAppAboutElement;
        "app-announce": HTMLAppAnnounceElement;
        "app-announce-create": HTMLAppAnnounceCreateElement;
        "app-announce-edit": HTMLAppAnnounceEditElement;
        "app-home": HTMLAppHomeElement;
        "app-import-posts": HTMLAppImportPostsElement;
        "app-post": HTMLAppPostElement;
        "app-post-form": HTMLAppPostFormElement;
        "app-root": HTMLAppRootElement;
        "app-signin": HTMLAppSigninElement;
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
    }
    interface ApHead {
        "pageTitle"?: string;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApImageInput {
        "border"?: boolean;
        "data"?: string;
        "label"?: string;
        "onImageChange"?: (event: CustomEvent<string>) => void;
        "onImageResizing"?: (event: CustomEvent<boolean>) => void;
        "resizeRect"?: { width: number; height: number };
    }
    interface ApInput {
        "label"?: string;
        "maxLength"?: number;
        "textarea"?: boolean;
        "value"?: string;
    }
    interface ApLoading {
    }
    interface ApModal {
        "onClose"?: (event: CustomEvent<any>) => void;
    }
    interface ApNavi {
        "links": ApNaviLink[];
        "position"?: 'fixed' | 'sticky';
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
        "onBeforePageRender"?: (event: CustomEvent<PageRenderData>) => void;
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
    interface AppAbout {
        "app": App;
    }
    interface AppAnnounce {
        "announceID": string;
        "app": App;
        "pageVisible": PageVisible;
    }
    interface AppAnnounceCreate {
        "app": App;
    }
    interface AppAnnounceEdit {
        "announceID": string;
        "app": App;
    }
    interface AppHome {
        "app": App;
        "pageVisible": PageVisible;
    }
    interface AppImportPosts {
        "announceID": string;
        "app": App;
    }
    interface AppPost {
        "announceID": string;
        "app": App;
        "pageVisible": PageVisible;
        "postID": string;
    }
    interface AppPostForm {
        "announceID": string;
        "app": App;
        "postID"?: string;
    }
    interface AppRoot {
    }
    interface AppSignin {
        "app": App;
    }
    interface IntrinsicElements {
        "ap-announce": ApAnnounce;
        "ap-checkbox": ApCheckbox;
        "ap-error": ApError;
        "ap-head": ApHead;
        "ap-icon": ApIcon;
        "ap-image": ApImage;
        "ap-image-input": ApImageInput;
        "ap-input": ApInput;
        "ap-loading": ApLoading;
        "ap-modal": ApModal;
        "ap-navi": ApNavi;
        "ap-post": ApPost;
        "ap-posts": ApPosts;
        "ap-root": ApRoot;
        "ap-spinner": ApSpinner;
        "ap-style": ApStyle;
        "ap-textview": ApTextview;
        "app-about": AppAbout;
        "app-announce": AppAnnounce;
        "app-announce-create": AppAnnounceCreate;
        "app-announce-edit": AppAnnounceEdit;
        "app-home": AppHome;
        "app-import-posts": AppImportPosts;
        "app-post": AppPost;
        "app-post-form": AppPostForm;
        "app-root": AppRoot;
        "app-signin": AppSignin;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "ap-announce": LocalJSX.ApAnnounce & JSXBase.HTMLAttributes<HTMLApAnnounceElement>;
            "ap-checkbox": LocalJSX.ApCheckbox & JSXBase.HTMLAttributes<HTMLApCheckboxElement>;
            "ap-error": LocalJSX.ApError & JSXBase.HTMLAttributes<HTMLApErrorElement>;
            "ap-head": LocalJSX.ApHead & JSXBase.HTMLAttributes<HTMLApHeadElement>;
            "ap-icon": LocalJSX.ApIcon & JSXBase.HTMLAttributes<HTMLApIconElement>;
            "ap-image": LocalJSX.ApImage & JSXBase.HTMLAttributes<HTMLApImageElement>;
            "ap-image-input": LocalJSX.ApImageInput & JSXBase.HTMLAttributes<HTMLApImageInputElement>;
            "ap-input": LocalJSX.ApInput & JSXBase.HTMLAttributes<HTMLApInputElement>;
            "ap-loading": LocalJSX.ApLoading & JSXBase.HTMLAttributes<HTMLApLoadingElement>;
            "ap-modal": LocalJSX.ApModal & JSXBase.HTMLAttributes<HTMLApModalElement>;
            "ap-navi": LocalJSX.ApNavi & JSXBase.HTMLAttributes<HTMLApNaviElement>;
            "ap-post": LocalJSX.ApPost & JSXBase.HTMLAttributes<HTMLApPostElement>;
            "ap-posts": LocalJSX.ApPosts & JSXBase.HTMLAttributes<HTMLApPostsElement>;
            "ap-root": LocalJSX.ApRoot & JSXBase.HTMLAttributes<HTMLApRootElement>;
            "ap-spinner": LocalJSX.ApSpinner & JSXBase.HTMLAttributes<HTMLApSpinnerElement>;
            "ap-style": LocalJSX.ApStyle & JSXBase.HTMLAttributes<HTMLApStyleElement>;
            "ap-textview": LocalJSX.ApTextview & JSXBase.HTMLAttributes<HTMLApTextviewElement>;
            "app-about": LocalJSX.AppAbout & JSXBase.HTMLAttributes<HTMLAppAboutElement>;
            "app-announce": LocalJSX.AppAnnounce & JSXBase.HTMLAttributes<HTMLAppAnnounceElement>;
            "app-announce-create": LocalJSX.AppAnnounceCreate & JSXBase.HTMLAttributes<HTMLAppAnnounceCreateElement>;
            "app-announce-edit": LocalJSX.AppAnnounceEdit & JSXBase.HTMLAttributes<HTMLAppAnnounceEditElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-import-posts": LocalJSX.AppImportPosts & JSXBase.HTMLAttributes<HTMLAppImportPostsElement>;
            "app-post": LocalJSX.AppPost & JSXBase.HTMLAttributes<HTMLAppPostElement>;
            "app-post-form": LocalJSX.AppPostForm & JSXBase.HTMLAttributes<HTMLAppPostFormElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-signin": LocalJSX.AppSignin & JSXBase.HTMLAttributes<HTMLAppSigninElement>;
        }
    }
}
