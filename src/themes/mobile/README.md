# TinyMCE mobile theme

There are two themes being used for mobile: `mobile` and `autochooser`. 

## Mobile

The mobile theme will always load the mobile experience, regardless of the device. For best results, you will need to enable the Mobile mode of your browser of choice (or use a simulator/device).


## Autochooser

The autochooser theme will only load the mobile theme when it detects a user agent that is a mobile device. Otherwise, it will load the usual modern theme.

## Development

In order to contribute to the development of the mobile theme, it is important to understand:

1. its dependencies
2. how the demo pages work
3. how the CSS works
4. how the tests work

### Dependencies

The mobile theme's dependencies are all packaged with npm. Several of them are sourced directly from our GIT repositories, so you will need to be within the VPN. Like all themes, the package.json is stored at the tinymce-mobile root directory, not the theme root directory. To fetch the latest dependencies, run:

`$ npm install` 


### Demo page

The demo page for the mobile theme is in `src/demo/html/demo.html`. Like all bolt demos, you will need to have run `bolt init` in the project directory first.

### Less

The `mobile` theme uses `less` for the CSS. This means that you have to add a preprocessing step to get the css files that you require. The expected option is to run `grunt watch` in the background from the `mobile` theme root directory. This will generate the css files when any changes to less files occur.

### Testing

There are a limited set of tests available at the moment for the mobile theme, but we are hoping to add more. They come in three forms:

1. atomic tests 
2. phantom tests
3. browser tests

Note, if running `grunt watch`, the atomic and phantom tests will run automatically on changes to files in the source tree.

#### Atomic tests

`$ grunt atomic-tests`

#### Phantom tests

`$ grunt phantom-tests`

#### Browser tests

There are two ways of running browser tests: manually and automatically. Manual tests will be sent to a port, and to run them, you browse to that location in your browser of choice.

`$ grunt browser-tests`

Automatic tests will create a browser window and run the tests automatically. They will require window focus (typically) as well as the installed webdrivers for the browser you are trying to run. The mobile theme uses chrome for its grunt task which can be installed via npm

`$ npm install chromedriver`

Then, use the grunt task: `browser-auto-tests`

`$ grunt browser-auto-tests`

## Deployment to AWS

As part of developing the beta, we are periodically uploading a `standalone` version to AWS. The steps for deployment are

1. Install the AWS command line interface (http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
2. Create a file in your home directory (~/.aws/credentials) with:

```
[tinymce-mobile-aws]
aws_access_key_id = {get from lastpass}
aws_secret_access_key = {get from lastpass}
```

The key is stored in `staging-aws-keys` and gives you access to the `morgan` account on aws. See the account's namesake if you need access.

3. Run `$ grunt standalone` from either the `autochooser` theme project root or the mobile theme project root. The `autochooser` will create a theme that will still run `modern` on desktop, whereas `mobile` will always be the `mobile` theme.

4. Run `$ aws --profile tinymce-mobile-aws s3 sync deploy-local s3://ephox-tinymce-mobile/${SUBDIRECTORY_NAME}` where `$SUBDIRECTORY_NAME` can be blank or any other subdirectory that you would like (typically JIRA issues). Once uploaded, the build will be available at http://ephox-tinymce-mobile.s3-website-us-east-1.amazonaws.com/${SUBDIRECTORY_NAME}/index.html

