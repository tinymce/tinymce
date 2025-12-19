#!groovy
@Library('waluigi@release/7') _

import groovy.transform.Field
@Field String ciAccountId = "103651136441"
@Field String ciRegistry = "${ciAccountId}.dkr.ecr.us-east-2.amazonaws.com"

standardProperties()

def runBedrockTest(String name, String command, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCmd = command + (runAll ? " --ignore-lerna-changed=true" : "")
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
  def bedrockCmd = "bun grunt headless-auto --useSelenium=true"
  runBedrockTest('headless', bedrockCmd, runAll)
}

def runSeleniumTests(String name, String browser, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCommand =
    "bun browser-test" +
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
  "bun browser-test" +
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
    "bun grunt browser-auto" +
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
  return {
    stage("${name}") {
      devPods.customConsumer(
        containers: [nodeLtsTest, awsCliContainer],
        base: 'node',
        build: cacheName
      ) {
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
  def nodeLtsPlaywright = devPods.getContainerDefaultArgs(nodeLts + [
    resourceRequestEphemeralStorage: '16Gi',
    resourceLimitEphemeralStorage: '16Gi'
  ]) + devPods.hiRes()

  def containers = [
    nodeLtsPlaywright,
    awsCliContainer,
    devPods.getContainerDefaultArgs([ name: 'playwright', image: 'mcr.microsoft.com/playwright:v1.53.1-noble']) + devPods.hiRes()
  ]

  return {
    stage("${name}") {
      devPods.customConsumer(
        containers: containers,
        base: 'node',
        build: cacheName
      ) {
        container('playwright') {
          // Install bun if not present (improved with retry logic)
          sh '''
            set -e
            if ! command -v bun &> /dev/null; then
              echo "Installing bun..."

              # Install dependencies with retry logic
              for i in 1 2 3; do
                (apt-get update -qq && apt-get install -y -qq unzip curl) && break || {
                  echo "Apt install attempt $i failed, retrying in 5s...";
                  sleep 5;
                }
              done

              # Install bun with retry logic
              for i in 1 2 3; do
                curl -fsSL https://bun.sh/install | bash && break || {
                  echo "Bun install attempt $i failed, retrying in 5s...";
                  sleep 5;
                }
              done

              # Verify installation
              export PATH="$HOME/.bun/bin:$PATH"
              bun --version || { echo "ERROR: Bun installation failed"; exit 1; }
              echo "Bun installed successfully: $(bun --version)"
            else
              echo "Bun already available: $(bun --version)"
            fi
          '''

          body()
        }
      }
    }
  }
}

def runSeleniumPod(String cacheName, String name, String browser, String version, Closure body) {
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
          resourceRequestCpu: '1',
          resourceRequestMemory: '500Mi',
          resourceLimitCpu: '1',
          resourceLimitMemory: '500Mi',
          resourceRequestEphemeralStorage: '4Gi',
          resourceLimitEphemeralStorage: '4Gi'
        ]
  return {
    stage("${name}") {
      devPods.customConsumer(
        containers: [
          nodeLtsSelenium,
          selenium,
          awsCliContainer
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
    echo "Merging ${primaryBranch} into this branch to run tests"
    // TBD: reenable soon
    // exec("git merge --no-commit --no-ff origin/${primaryBranch}")
  }
}

def cleanBuildName(String name) {
  def parts = name.split('/')
  return parts[parts.size() - 1]
}

def props

// def cacheName = "cache_${BUILD_TAG}"
def cacheName = "${env.JOB_NAME.split('/').last()}_${env.BUILD_NUMBER}"

def testPrefix = "tinymce_${cleanBuildName(env.BRANCH_NAME)}-build${env.BUILD_NUMBER}"

// Resource allocation patterns
Map podResources = [
  resourceRequestCpu: '2',
  resourceLimitCpu: '7.5',
  resourceRequestEphemeralStorage: '16Gi',
  resourceLimitEphemeralStorage: '16Gi'
]

Map testResources = podResources + [
  resourceRequestMemory: '6Gi',
  resourceLimitMemory: '6Gi'
]

Map buildResources = podResources + [
  resourceRequestMemory: '4Gi',
  resourceLimitMemory: '4Gi'
]

Map seleniumNodeResources = [
  resourceRequestCpu: '4',
  resourceLimitCpu: '7',
  resourceRequestMemory: '4Gi',
  resourceLimitMemory: '4Gi',
  resourceRequestEphemeralStorage: '8Gi',
  resourceLimitEphemeralStorage: '8Gi'
]

// Container definitions
@Field def nodeLts
nodeLts = [
  name: 'node',
  image: "${ciRegistry}/build-containers/node-lts:lts",
  runAsGroup: '1000',
  runAsUser: '1000'
]

def nodeLtsBuild = devPods.getContainerDefaultArgs(nodeLts + buildResources)
@Field def nodeLtsTest
nodeLtsTest = devPods.getContainerDefaultArgs(nodeLts + testResources)
@Field def nodeLtsSelenium
nodeLtsSelenium = devPods.getContainerDefaultArgs(nodeLts + seleniumNodeResources + [command: 'sleep', args: 'infinity'])

def awsCli = [
  name: 'aws-cli',
  image: 'public.ecr.aws/aws-cli/aws-cli:latest',
  runAsGroup: '1000',
  runAsUser: '1000',
  resourceRequestEphemeralStorage: '2Gi',
  resourceLimitEphemeralStorage: '4Gi'
]
@Field def awsCliContainer
awsCliContainer = devPods.getContainerDefaultArgs(awsCli) + devPods.stdRes()

timestamps { notifyStatusChange(
  cleanupStep: { devPods.cleanUpPod(build: cacheName) },
  branches: ['main', 'release/7', 'release/8'],
  channel: '#tinymce-build-status',
  name: 'TinyMCE',
  mention: true
  ) {
  def checkoutStep = {
    tinyGit.addGitHubToKnownHosts()
    checkout localBranch(scm, [ lfs() ])
    tinyGit.addAuthorConfig()
  }

  devPods.custom(
    containers: [nodeLtsBuild, awsCliContainer],
    build: cacheName,
    checkoutStep: checkoutStep
  ) {
    container('node') {
      props = readProperties(file: 'build.properties')
      String primaryBranch = props.primaryBranch
      assert primaryBranch != null && primaryBranch != ""


      stage('Deps') {
        // cancel build if primary branch doesn't merge cleanly
        gitMerge(primaryBranch)
        sh 'bun install'
      }

      stage('Build') {
        // verify no errors in changelog merge
        exec("bun changie-merge")
        withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
          // type check and build TinyMCE
          exec("bun ci-all-seq")

          // validate documentation generator
          exec("bun tinymce-grunt shell:moxiedoc")
        }
      }
      // Prep cache
      sh "mkdir -p /tmp && tar -zcf /tmp/file.tar.gz . && cp /tmp/file.tar.gz ./file.tar.gz"
    }

    container('aws-cli') {
      tinyAws.withAWSEngineeringCICredentials('tinymce_pipeline_cache') {
        String tar = './file.tar.gz'
        String cache = 's3://tiny-freerange-testing/remote-builds'
        String buildName = cacheName
        sh "aws s3 cp ${tar} ${cache}/${buildName}.tar.gz --only-show-errors"
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

  processes['playwright'] = runPlaywrightPod(cacheName, 'playwright-tests') {
    sh 'export PATH="$HOME/.bun/bin:$PATH" && bun --silent --cwd modules/oxide-components test-ci'
    junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results.xml'
    sh 'export PATH="$HOME/.bun/bin:$PATH" && bun --silent --cwd modules/oxide-components build-storybook'
    def visualTestStatus = sh(script: 'export PATH="$HOME/.bun/bin:$PATH" && bun --silent --cwd modules/oxide-components test-visual-ci', returnStatus: true)
    if (visualTestStatus == 4) {
      unstable("Visual tests failed")
    } else if (visualTestStatus != 0) {
      error("Unexpected error running visual tests")
    }
    junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results-visual.xml'
    exec('find modules/oxide-components -name "*.png" -type f || echo "No PNG files found"')
    archiveArtifacts artifacts: 'modules/oxide-components/test-results/**/*.png', allowEmptyArchive: true, fingerprint: true
  }

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }

  def deployCheckoutStep = {
    tinyGit.addGitHubToKnownHosts()
    checkout localBranch(scm)
    sh "tar -zxf ./file.tar.gz"
    tinyGit.addAuthorConfig()
  }

  devPods.custom(
    containers: [nodeLtsBuild],
    build: cacheName,
    checkoutStep: deployCheckoutStep
  ) {
    container('node') {
      props = readProperties(file: 'build.properties')
      String primaryBranch = props.primaryBranch
      assert primaryBranch != null && primaryBranch != ""

      stage('Deploy Storybook') {
        if (env.BRANCH_NAME == primaryBranch) {
          echo "Deploying Storybook"
          tinyGit.withGitHubSSHCredentials {
            exec('bun --silent --cwd modules/oxide-components deploy-storybook')
          }
        } else {
          echo "Skipping Storybook deployment as the pipeline is not running on the primary branch"
        }
      }
    }
  }
}}
