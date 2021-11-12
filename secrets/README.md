# Secrets Files

## appenv.env.ts

See [src/shared/appenv.ts](../src/shared/appenv.ts)

## .firebaserc

(example)

```
{
  "projects": {
    "default": "my-announcing"
  },
  "targets": {
    "my-announcing": {
      "hosting": {
        "docs": [
          "my-announcing-docs"
        ],
        "console": [
          "my-announcing-console"
        ],
        "client": [
          "my-announcing"
        ]
      }
    }
  }
}
```

## android.custom.properties

(example)

```
appLinkHostName=my-announcing.web.app
```

See [capacitor/client/android/app/build.gradle](../capacitor/client/android/app/build.gradle)

## assetlinks.json

See https://developer.android.com/training/app-links/verify-site-associations

## google-services.json

Download from Firebase Console.

See https://firebase.google.com/docs/projects/multiprojects

## play-console-account.json

Download from Play Console.

## upload-keystore.jks

See https://developer.android.com/studio/publish/app-signing

## apple-app-site-association

See https://developer.apple.com/documentation/xcode/supporting-associated-domains

## App.entitlements

(example)

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>development</string>
	<key>com.apple.developer.associated-domains</key>
	<array>
		<string>applinks:my-announcing.web.app</string>
	</array>
</dict>
</plist>
```

## GoogleService-Info.plist

Download from Firebase Console.

## Ad_Hoc.mobileprovision

Download from Apple Developer Console.

## AppleDistribution.p12

## .secrets.json

(example)

```
{
  "FIREBASE_APP_ID_ANDROID": "---from firebase console---",
  "FIREBASE_APP_ID_IOS": "---from firebase console---"
}
```

## SECRET_VALUES.txt

See [scripts/secrets/pack.ts](../scripts/secrets/pack.ts)

# Other Secrets

- FIREBASE_TOKEN
- FIREBASE_APP_ID_ANDROID
- FIREBASE_APP_ID_IOS
- APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD
