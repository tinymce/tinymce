#!groovy
@Library('waluigi@release/7') _

standardProperties()

def runBedrockTest(String name, String command, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCmd = command + (runAll ? " --ignore-lerna-changed=true" : "")
  echo "Running Bedrock cmd: ${command}"
  def testStatus = sh(script: command, returnStatus: true)
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (testStatus == 4) {
    unstable("Tests failed for ${name}")
  } else if (testStatus != 0) {
    if (retry > 0) {
      echo "Running retry [${retry}] after [${timeout}]"
      sleep(timeout)
      runBedrockTest(name, command, runAll, retry - 1, timeout)
    } else {
      archiveArtifacts artifacts: 'scratch/TEST-*.xml', onlyIfSuccessful: false
      error("Unexpected error in ${name} ")
    }
  }
}

def runHeadlessTests(Boolean runAll) {
  def bedrockCmd = "yarn grunt headless-auto"
  runBedrockTest('headless', bedrockCmd, runAll)
}

def runRemoteTests(String name, String browser, String provider, String platform, String arn, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def awsOpts = " --sishDomain=sish.osu.tiny.work --devicefarmArn=${arn}"
  def platformName = platform != null ? " --platformName='${platform}'" : ""
  def bedrockCommand =
  "yarn browser-test" +
    " --chunk=400" +
    " --bedrock-browser=" + browser +
    " --remote=" + provider +
    " --bucket=" + bucket +
    " --buckets=" + buckets +
    " --name=" + name +
    "${provider == 'aws' ? awsOpts : ''}" +
    "${platformName}"
    runBedrockTest(name, bedrockCommand, runAll, retry, timeout)
}


def runBrowserTests(String name, String browser, String platform, String bucket, String buckets, Boolean runAll) {
  def bedrockCommand =
    "yarn grunt browser-auto" +
      " --chunk=400" +
      " --bedrock-os=" + os +
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

def runTestPod(String cacheName, String name, String testname, String browser, String provider, String platform, String bucket, String buckets, Boolean runAll) {
  return {
    bedrockRemoteTools.nodeConsumerPod(
      nodeOpts: [
        resourceRequestCpu: '1',
        resourceLimitCpu: '7.5',
        resourceLimitMemory: '4Gi',
        resourceLimitEphemeralStorage: '16Gi',
      ],
      build: cacheName,
      useContainers: ['node', 'aws-cli']
    ) {

      stage("${name}") {
        grunt('list-changed-browser')
        bedrockRemoteTools.withRemoteCreds(provider) {
          int retry = provider == 'lambdatest' ? 1 : 0
          withCredentials([string(credentialsId: 'devicefarm-testgridarn', variable: 'DF_ARN')]) {
            runRemoteTests(testname, browser, provider, platform, DF_ARN, bucket, buckets, runAll, retry, 180)
          }
        }
      }
    }
  }
}

def runTestNode(String name, String browser, String platform, String bucket, String buckets, Boolean runAll) {
  return {
    stage(name) {
      node("bedrock-${platform}") {
        echo "Bedrock tests for ${name} on $NODE_NAME"
        checkout(scm)
        tinyGit.addAuthorConfig()
        gitMerge(primaryBranch)

        // Clean and Install
        exec("git clean -fdx modules scratch js dist")
        yarnInstall()

        exec("yarn ci")
        echo "Running browser tests"
        //(String name, String browser, String platform, String bucket, String buckets, Boolean runAll)
        runBrowserTests(name, browser, platform, bucket, buckets, runAll)
      }
    }
  }
}

def runHeadlessPod(String cacheName, Boolean runAll) {
  return {
    bedrockRemoteTools.nodeConsumerPod(
      nodeOpts: [
        resourceLimitCpu: '7',
        resourceLimitMemory: '4Gi',
        resourceLimitEphemeralStorage: '16Gi'
      ],
      build: cacheName
    ) {
      stage("Headless-chrome") {
        yarnInstall()
        grunt('list-changed-headless')
        runHeadlessTests(runAll)
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

def props

def cacheName = "cache_${BUILD_TAG}"

timestamps {
  bedrockRemoteTools.nodeProducerPod(
    nodeOpts: [
      resourceRequestCpu: '2',
      resourceRequestMemory: '4Gi',
      resourceLimitCpu: '7.5',
      resourceLimitMemory: '4Gi'
    ],
    build: cacheName
  ) {
    props = readProperties(file: 'build.properties')
    String primaryBranch = props.primaryBranch
    assert primaryBranch != null && primaryBranch != ""

    stage('Merge') {
      // cancel build if primary branch doesn't merge cleanly
      gitMerge(primaryBranch)
    }

    stage('Install') {
      yarnInstall()
    }

    stage("Validate changelog") {
      // we use a changelog to run changie
      exec("yarn changie-merge")
    }

    stage('Type check') {
      withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
        exec("yarn ci-all-seq")
      }
    }

    stage('Moxiedoc check') {
      sh 'yarn tinymce-grunt shell:moxiedoc'
    }
  }

  def platforms = [
    // No provider uses local nodes
    [ browser: 'chrome', os: 'windows'],
    [ browser: 'safari', os: 'macos'],
    // Provider test will use remote services
    [ browser: 'chrome', provider: 'aws', buckets: 2 ],
    // [ browser: 'edge', provider: 'aws', buckets: 2 ],
    // [ browser: 'firefox', provider: 'aws', buckets: 2 ],
    // [ browser: 'edge', provider: 'lambdatest', buckets: 1 ],
    // [ browser: 'safari', provider: 'lambdatest', buckets: 1 ],
    [ browser: 'chrome', provider: 'lambdatest', os: 'macOS Sonoma', buckets: 2],
    // [ browser: 'firefox', provider: 'lambdatest', os: 'macOS Sonoma', buckets: 1]
  ];

  def processes = [:]
  def runAllTests = env.BRANCH_NAME == props.primaryBranch

  for (int i = 0; i < platforms.size(); i++) {
    def platform = platforms.get(i)
    def buckets = platform.buckets ?: 1
    for (int bucket = 1; bucket <= buckets; bucket ++) {
      def suffix = buckets == 1 ? "" : "-" + bucket + "-" + buckets
      def os = String.valueOf(platform.os).startsWith('mac') ? 'Mac' : 'Win'
      def s_bucket = "${bucket}"
      def s_buckets = "${buckets}"
      def name = "${os}-${platform.browser}-${platform.provider}${suffix}"
      if (platform.provider) {
        // use local
        processes[name] = runTestNode(name, platform.browser, platform.os, s_bucket, s_buckets, runAllTests)
      } else {
        // use remote
        def testname = "tinymce_${env.BRANCH_NAME}_${env.BUILD_NUMBER}"
        processes[name] = runTestPod(cacheName, name, testname, platform.browser, platform.provider, platform.os, s_bucket, s_buckets, runAllTests)
      }
    }
  }

  processes['headless'] = runHeadlessPod(cacheName, runAllTests)

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }

  bedrockRemoteTools.cleanUpPod(cacheName)
}