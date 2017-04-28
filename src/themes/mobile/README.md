# TinyMCE mobile theme

There are two themes being used for mobile: `mobile` and `autochooser`. 

## Mobile

The mobile theme is 


## Autochooser



## Demo page

bolt init



## Dependencies

npm install

alloy and boulder should be retrieved from GIT.




## Less

The `mobile` theme uses `less` for the CSS. This means that you have to add a preprocessing step to get the css files that you require. The expected option is to run `grunt watch` in the background from the `mobile` theme root directory. This will generate the css files when any changes to less files occur.

## Running tests

The mobile theme has a small group of tests: `atomic`, `phantom` and `browser`. 

## Deploying to AWS

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

