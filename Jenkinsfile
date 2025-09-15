#!groovy
@Library('waluigi@release/7') _

standardProperties()

Map podResources = [
  resourceRequestCpu: '2',
  resourceLimitCpu: '7.5',
  resourceRequestEphemeralStorage: '16Gi',
  resourceLimitEphemeralStorage: '16Gi'
]

Map buildResources = podResources + [
  resourceRequestMemory: '4Gi',
  resourceLimitMemory: '4Gi'
]

// Ensure variables are accessible in scopes
import groovy.transform.Field
@Field String ciAccountId = "103651136441"
@Field String ciRegistry = "${ciAccountId}.dkr.ecr.us-east-2.amazonaws.com"

def bunInstall() {
  exec('bun install')
  // Manually create missing symlinks that bun failed to create in CI
  exec('''
    echo "=== Creating missing binary symlinks ==="
    cd node_modules/.bin
    ln -sf ../lerna/dist/cli.js lerna
    ln -sf ../eslint/bin/eslint.js eslint
    ln -sf ../grunt/bin/grunt grunt
    ln -sf ../@tinymce/moxiedoc/dist/lib/cli.js moxiedoc
    ln -sf ../typescript/bin/tsc tsc
    ln -sf ../changie/npm/changie.js changie
    echo "Setting execute permissions on symlinks:"
    chmod +x lerna eslint grunt moxiedoc tsc changie
    echo "Verifying symlinks and permissions:"
    ls -la lerna eslint grunt moxiedoc tsc changie
  ''')
}

def checkoutAndMergeStep = {
  tinyGit.addGitHubToKnownHosts()
  checkout localBranch(scm)
  tinyGit.addAuthorConfig()
}

def runBedrockTest(String name, String command, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCmd = 'export PATH="$PWD/node_modules/.bin:$PATH"; ' + command + (runAll ? " --ignore-lerna-changed=true" : "")
  echo "Running Bedrock cmd: ${bedrockCmd}"
  def testStatus = sh(script: bedrockCmd, returnStatus: true)
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (testStatus == 4) {
    unstable("Tests failed for ${name}")
  } else if (testStatus != 0) {
    if (retry > 0) {
      echo "Running retry [${retry}] after [${timeout}]"
      sleep(timeout)
      runBedrockTest(name, command, runAll, retry - 1, timeout)
    } else {
      error("Unexpected error in ${name} ")
    }
  }
}

def runHeadlessTests(Boolean runAll) {
  // Use package script to ensure local bin resolution
  def bedrockCmd = "bun run headless-test -- --useSelenium=true"
  runBedrockTest('headless', bedrockCmd, runAll)
}

def runSeleniumTests(String name, String browser, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCommand =
    "bun run browser-test --" +
    " --chunk=2000" +
    " --bedrock-browser=" + browser +
    " --bucket=" + bucket +
    " --buckets=" + buckets +
    " --name=" + name +
    " --useSelenium=true"
  runBedrockTest(name, bedrockCommand, runAll, retry, timeout)
}

def runRemoteTests(String name, String browser, String provider, String platform, String version, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def awsOpts = " --sishDomain=sish.osu.tiny.work"
  def platformName = platform != null ? " --platformName='${platform}'" : ""
  def browserVersion = version != null ? " --browserVersion=${version}" : ""
  def bedrockCommand =
  "bun run browser-test --" +
    " --chunk=2000" +
    " --bedrock-browser=" + browser +
    " --remote=" + provider +
    " --bucket=" + bucket +
    " --buckets=" + buckets +
    " --name=" + name +
    "${provider == 'aws' ? awsOpts : ''}" +
    "${platformName}" +
    "${browserVersion}"
    runBedrockTest(name, bedrockCommand, runAll, retry, timeout)
}


def runBrowserTests(String name, String browser, String platform, String bucket, String buckets, Boolean runAll) {
  def bedrockCommand =
    "bun run browser-test --" +
      " --chunk=2000" +
      " --bedrock-os=" + platform +
      " --bedrock-browser=" + browser +
      " --bucket=" + bucket +
      " --buckets=" + buckets;

  // Clean scratch dir for existing nodes
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }
  runBedrockTest(name, bedrockCommand, runAll)
}

def runTestPod(String cacheName, String name, String testname, String browser, String provider, String platform, String version, String bucket, String buckets, Boolean runAll) {
  def containers = [
    devPods.getContainerDefaultArgs([ name: 'node', image: "${ciRegistry}/build-containers/node-lts:lts", runAsGroup: '1000', runAsUser: '1000',
          resourceRequestEphemeralStorage: '1Gi',
          resourceLimitEphemeralStorage: '1Gi' ]) + devPods.hiRes(),
    devPods.getContainerDefaultArgs([ name: 'aws-cli', image: 'public.ecr.aws/aws-cli/aws-cli:latest', runAsGroup: '1000', runAsUser: '1000',
          resourceRequestEphemeralStorage: '1Gi',
          resourceLimitEphemeralStorage: '1Gi' ]) + devPods.stdRes()
  ]
  return {
    stage("${name}") {
      devPods.customConsumer(
        build: cacheName,
        containers: containers,
      ) {
        container('aws-cli') {
          sh '''
            set -e
            if [ ! -d node_modules ]; then
              echo "Falling back to explicit S3 fetch of build cache"
              export AWS_RETRY_MODE=standard AWS_MAX_ATTEMPTS=10
              for i in 1 2 3 4 5; do
                aws s3 cp s3://tiny-freerange-testing/remote-builds/${cacheName}.tar.gz ./file.tar.gz --no-progress && break || true
                echo "Retry $i failed; sleeping..."; sleep $((i*10))
              done
              tar -zxf ./file.tar.gz
            fi
          '''
        }
        container('node') {
          grunt('list-changed-browser')
          bedrockRemoteTools.tinyWorkSishTunnel()
          bedrockRemoteTools.withRemoteCreds(provider) {
            int retry = 0
            runRemoteTests(testname, browser, provider, platform, version, bucket, buckets, runAll, retry, 180)
          }
        }
      }
    }
  }
}

def runPlaywrightPod(String cacheName, String name, Closure body) {

  def containers = [
    devPods.getContainerDefaultArgs([ name: 'node', image: "${ciRegistry}/build-containers/node-lts:lts", runAsGroup: '1000', runAsUser: '1000' ]) + devPods.hiRes(),
    devPods.getContainerDefaultArgs([ name: 'aws-cli', image: 'public.ecr.aws/aws-cli/aws-cli:latest', runAsGroup: '1000', runAsUser: '1000' ]) + devPods.lowRes(),
    devPods.getContainerDefaultArgs([ name: 'playwright', image: 'mcr.microsoft.com/playwright:v1.53.1-noble']) + devPods.hiRes()
  ]

  return {
    stage("${name}") {
      devPods.customConsumer(
        containers: containers,
        build: cacheName
      ) {
        container('playwright') {
          body()
        }
      }
    }
  }
}

def runSeleniumPod(String cacheName, String name, String browser, String version, Closure body) {
  Map node = [
          name: 'node',
          image: "${ciRegistry}/build-containers/node-lts:lts",
          command: 'sleep',
          args: 'infinity',
          resourceRequestCpu: '4',
          resourceRequestMemory: '4Gi',
          resourceRequestEphemeralStorage: '8Gi',
          resourceLimitCpu: '7',
          resourceLimitMemory: '4Gi',
          resourceLimitEphemeralStorage: '12Gi',
          runAsGroup: '1000', runAsUser: '1000'
        ]
  Map selenium = [
          name: "selenium",
          image: tinyAws.getPullThroughCacheImage("selenium/standalone-${browser}", version),
          livenessProbe: [
            execArgs: "curl --fail --silent --output /dev/null http://localhost:4444/wd/hub/status",
            initialDelaySeconds: 30,
            periodSeconds: 5,
            timeoutSeconds: 15,
            failureThreshold: 6
          ],
          alwaysPullImage: true,
          resourceRequestCpu: '2',
          resourceRequestMemory: '2Gi',
          resourceLimitCpu: '4',
          resourceLimitMemory: '6Gi',
          resourceRequestEphemeralStorage: '4Gi',
          resourceLimitEphemeralStorage: '6Gi'
        ]
  Map aws = [
          name: 'aws-cli',
          image: 'public.ecr.aws/aws-cli/aws-cli:latest',
          command: 'sleep',
          args: 'infinity',
          alwaysPullImage: true,
          resourceRequestCpu: '2',
          resourceRequestMemory: '2Gi',
          resourceLimitCpu: '4',
          resourceLimitMemory: '6Gi',
          resourceRequestEphemeralStorage: '1Gi',
          resourceLimitEphemeralStorage: '1Gi'
        ]
  return {
    stage("${name}") {
      devPods.customConsumer(
        containers: [
          node,
          selenium,
          aws
        ],
        base: 'node',
        build: cacheName
      ) {
        container('node') {
          body()
        }
      }
    }
  }
}

def gitMerge(String primaryBranch) {
  if (env.BRANCH_NAME != primaryBranch) {
    // echo "Merging ${primaryBranch} into this branch to run tests"
    // exec("git merge --no-commit --no-ff origin/${primaryBranch}")
    echo "SKIPPING MERGE: Merging ${primaryBranch} into this branch to run tests (temporarily disabled for spike testing)"

  }
}

def cleanBuildName(String name) {
  def parts = name.split('/')
  return parts[parts.size() - 1]
}

def props

def cacheName = "cache_${BUILD_TAG}"

def testPrefix = "tinymce_${cleanBuildName(env.BRANCH_NAME)}-build${env.BUILD_NUMBER}"

timestamps {

  def nodeLts = [ name: 'node-lts', image: "${ciRegistry}/build-containers/node-lts:lts", runAsGroup: '1000', runAsUser: '1000' ]
  def nodeLtsResources = devPods.getContainerDefaultArgs(nodeLts + buildResources)
  def aws = devPods.getContainerDefaultArgs(devPods.awsImage() + devPods.lowRes())

  notifyStatusChange(
  cleanupStep: { devPods.cleanUpPod(build: cacheName) },
  branches: ['main', 'release/7', 'release/8'],
  channel: '#tinymce-build-status',
  name: 'TinyMCE',
  mention: true
  ) {
  devPods.custom(containers: [ nodeLtsResources, aws ], checkoutStep: checkoutAndMergeStep) {
    container('node-lts') {
      props = readProperties(file: 'build.properties')
      String primaryBranch = props.primaryBranch
      assert primaryBranch != null && primaryBranch != ""


      stage('Deps') {
        // cancel build if primary branch doesn't merge cleanly
        gitMerge(primaryBranch)
        // Install dependencies using Bun
        bunInstall()
      }

      stage('Build') {
        // verify no errors in changelog merge
        // exec("bun changie-merge") // TODO: changie not available in node-lts container
        withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
          // Use Premium's direct binary path approach (no PATH dependency)
          sh '''
            echo "=== Using direct node execution to bypass symlink issues ==="
            echo "Testing direct node execution:"
            node node_modules/npm-run-all2/bin/npm-run-all/index.js --version || echo "npm-run-all direct execution failed"
            echo "Running build with direct node calls:"
            node node_modules/npm-run-all2/bin/npm-run-all/index.js -p eslint ci-seq -s tinymce-rollup
            bun tinymce-grunt shell:moxiedoc
          '''
        }
      }

      sh '''
        echo "=== Creating CI artifact (exclude only non-dependency content) ==="
        mkdir -p /tmp
        tar -zcf /tmp/file.tar.gz \
          --exclude='./.git' \
          --exclude='./.github' \
          --exclude='./scratch' \
          --exclude='./dist' \
          --exclude='./js' \
          --exclude='./**/*.log' \
          --exclude='./**/.cache' \
          --exclude='./**/coverage' \
          --exclude='./modules/**/storybook-static' \
          ./*
        cp /tmp/file.tar.gz ./file.tar.gz
      '''
    }

    container('aws-cli') {
      tinyAws.withAWSEngineeringCICredentials('tinymce_pipeline_cache') {
        sh "aws s3 cp ./file.tar.gz s3://tiny-freerange-testing/remote-builds/${cacheName}.tar.gz"
      }
    }
  }

  // [ browser: 'chrome', provider: 'aws', buckets: 2 ],
  // [ browser: 'edge', provider: 'aws', buckets: 2 ],
  // [ browser: 'firefox', provider: 'aws', buckets: 2 ],

  def winChrome = [ browser: 'chrome', provider: 'lambdatest', os: 'windows', buckets: 1 ]
  def winFirefox = [ browser: 'firefox', provider: 'lambdatest', os: 'windows', buckets: 1 ]
  def winEdge = [ browser: 'edge', provider: 'lambdatest', os: 'windows', buckets: 1 ]

  def macChrome = [ browser: 'chrome', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]
  def macFirefox = [ browser: 'firefox', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]
  def macSafari = [ browser: 'safari', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]

  def seleniumFirefox = [ browser: 'firefox', provider: 'selenium', buckets: 1 ]
  def seleniumChrome = [ browser: 'chrome', provider: 'selenium', version: '127.0', buckets: 1 ]
  def seleniumEdge = [ browser: 'edge', provider: 'selenium', buckets: 1 ]

  def branchBuildPlatforms = [
    winChrome,
    winFirefox,
    macSafari,
  ]

  def primaryBuildPlatforms = branchBuildPlatforms + [
    winEdge,
    macChrome,
    macFirefox
  ];

  def buildingPrimary = env.BRANCH_NAME == props.primaryBranch
  def platforms = buildingPrimary ? primaryBuildPlatforms : branchBuildPlatforms

  def processes = [:]
  def runAllTests = buildingPrimary

  for (int i = 0; i < platforms.size(); i++) {
    def platform = platforms.get(i)
    def buckets = platform.buckets ?: 1
    for (int bucket = 1; bucket <= buckets; bucket ++) {
      def suffix = buckets == 1 ? "" : "-" + bucket + "-" + buckets
      def os = String.valueOf(platform.os).startsWith('mac') ? 'Mac' : 'Win'
      def s_bucket = "${bucket}"
      def s_buckets = "${buckets}"
      switch(platform.provider) {
        case ['aws', 'lambdatest']:
          def browserVersion = platform.version ? "-${platform.version}" : ""
          def name = "${os}-${platform.browser}${browserVersion}-${platform.provider}${suffix}"
          def testName = "${env.BUILD_NUMBER}-${os}-${platform.browser}"
          processes[name] = runTestPod(cacheName, name, "${testPrefix}_${testName}", platform.browser, platform.provider, platform.os, platform.version, s_bucket, s_buckets, runAllTests)
        break;
        case 'selenium':
          def name = "selenium-${platform.browser}${suffix}";
          def browserVersion = platform.version ?: 'latest'
          processes[name] = runSeleniumPod(cacheName, name, platform.browser, browserVersion) {
            runSeleniumTests(name, platform.browser, s_bucket, s_buckets, runAllTests)
          }
        break;
        default:
        error("Unknown or missing provider for test ${platform.browser}")
        break;
      }
    }
  }

  processes['headless'] = runSeleniumPod(cacheName, 'headless-chrome', 'chrome', '127.0') {
    grunt('list-changed-headless')
    runHeadlessTests(runAllTests)
  }

  // Temporarily skip Playwright while stabilizing CI
  // processes['playwright'] = runPlaywrightPod(cacheName, 'playwright-tests') {
  //   exec('bun run -F @tinymce/oxide-components test-ci')
  //   junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results.xml'
  //   def visualTestStatus = exec(script: 'bun run -F @tinymce/oxide-components test-visual-ci', returnStatus: true)
  //   if (visualTestStatus == 4) {
  //     unstable("Visual tests failed")
  //   } else if (visualTestStatus != 0) {
  //     error("Unexpected error running visual tests")
  //   }
  //   junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results-visual.xml'
  //   exec('find modules/oxide-components -name "*.png" -type f || echo "No PNG files found")
  //   archiveArtifacts artifacts: 'modules/oxide-components/test-results/**/*.png', allowEmptyArchive: true, fingerprint: true
  // }

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }

  devPods.custom(containers: [ nodeLtsResources ], checkoutStep: checkoutAndMergeStep) {
    container('node-lts') {
      props = readProperties(file: 'build.properties')
      String primaryBranch = props.primaryBranch
      assert primaryBranch != null && primaryBranch != ""

      stage('Deploy Storybook') {
        if (env.BRANCH_NAME == primaryBranch) {
          echo "Deploying Storybook"
          tinyGit.withGitHubSSHCredentials {
            exec('bun run -F @tinymce/oxide-components deploy-storybook')
          }
        } else {
          echo "Skipping Storybook deployment as the pipeline is not running on the primary branch"
        }
      }
    }
  }
}}
