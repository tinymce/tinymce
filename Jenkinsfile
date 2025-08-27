#!groovy
@Library('waluigi@release/7') _

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
  def bedrockCmd = "yarn grunt headless-auto --useSelenium=true"
  runBedrockTest('headless', bedrockCmd, runAll)
}

def runSeleniumTests(String name, String browser, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCommand =
    "yarn browser-test" +
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
  "yarn browser-test" +
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
    "yarn grunt browser-auto" +
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
      devPods.nodeConsumer(
        nodeOpts: [
          resourceRequestCpu: '2',
          resourceRequestMemory: '6Gi',
          resourceRequestEphemeralStorage: '16Gi',
          resourceLimitCpu: '7',
          resourceLimitMemory: '6Gi',
          resourceLimitEphemeralStorage: '16Gi'
        ],
        tag: '20',
        build: cacheName,
        useContainers: ['node', 'aws-cli']
      ) {
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

def runPlaywrightPod(String cacheName, String name, Closure body) {

  def containers = [
    devPods.getContainerDefaultArgs([ name: 'node', image: "public.ecr.aws/docker/library/node:20", runAsGroup: '1000', runAsUser: '1000' ]) + devPods.hiRes(),
    devPods.getContainerDefaultArgs([ name: 'aws-cli', image: 'public.ecr.aws/aws-cli/aws-cli:latest', runAsGroup: '1000', runAsUser: '1000' ]) + devPods.lowRes(),
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
          body()
        }
      }
    }
  }
}

def runSeleniumPod(String cacheName, String name, String browser, String version, Closure body) {
  Map node = [
          name: 'node',
          image: "public.ecr.aws/docker/library/node:20",
          command: 'sleep',
          args: 'infinity',
          resourceRequestCpu: '4',
          resourceRequestMemory: '4Gi',
          resourceRequestEphemeralStorage: '8Gi',
          resourceLimitCpu: '7',
          resourceLimitMemory: '4Gi',
          resourceLimitEphemeralStorage: '8Gi',
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
          resourceRequestCpu: '1',
          resourceRequestMemory: '500Mi',
          resourceLimitCpu: '1',
          resourceLimitMemory: '500Mi',
          resourceRequestEphemeralStorage: '4Gi',
          resourceLimitEphemeralStorage: '4Gi'
        ]
  Map aws = [
          name: 'aws-cli',
          image: 'public.ecr.aws/aws-cli/aws-cli:latest',
          command: 'sleep',
          args: 'infinity',
          alwaysPullImage: true,
          resourceRequestEphemeralStorage: '1Gi',
          resourceLimitEphemeralStorage: '1Gi'
        ] + devPods.lowRes()
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
    echo "Merging ${primaryBranch} into this branch to run tests"
    exec("git merge --no-commit --no-ff origin/${primaryBranch}")
  }
}

def cleanBuildName(String name) {
  def parts = name.split('/')
  return parts[parts.size() - 1]
}

def props

def cacheName = "cache_${BUILD_TAG}"

def testPrefix = "tinymce_${cleanBuildName(env.BRANCH_NAME)}-build${env.BUILD_NUMBER}"

timestamps { notifyStatusChange(
  cleanupStep: { devPods.cleanUpPod(build: cacheName) },
  branches: ['main', 'release/7', 'release/8'],
  channel: '#tinymce-build-status',
  name: 'TinyMCE',
  mention: true
  ) {
  devPods.nodeProducer(
    nodeOpts: [
      resourceRequestCpu: '2',
      resourceRequestMemory: '4Gi',
      resourceRequestEphemeralStorage: '16Gi',
      resourceLimitCpu: '7.5',
      resourceLimitMemory: '4Gi',
      resourceLimitEphemeralStorage: '16Gi'
    ],
    tag: '20',
    build: cacheName
  ) {
    props = readProperties(file: 'build.properties')
    String primaryBranch = props.primaryBranch
    assert primaryBranch != null && primaryBranch != ""


    stage('Deps') {
      // cancel build if primary branch doesn't merge cleanly
      gitMerge(primaryBranch)
      yarnInstall()
    }

    stage('Build') {
      // verify no errors in changelog merge
      exec("yarn changie-merge")
      withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
        // type check and build TinyMCE
        exec("yarn ci-all-seq")

        // validate documentation generator
        exec("yarn tinymce-grunt shell:moxiedoc")
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
    exec('yarn -s --cwd modules/oxide-components test-ci')
    junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results.xml'
    exec('yarn -s --cwd modules/oxide-components test-visual-ci')
    junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results-visual.xml'
    archiveArtifacts artifacts: 'modules/oxide-components/test-results/**/*.png', allowEmptyArchive: true, fingerprint: true
  }

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }

}}
