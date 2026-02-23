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

def nodeImg = [
  name: 'node',
  image: "public.ecr.aws/docker/library/node:22.20.0"
] + devPods.hiRes() + devPods.midStorage()

def seleniumImg = [
  name: "selenium",
  image: tinyAws.getPullThroughCacheImage("selenium/standalone-chrome", '127.0'),
  livenessProbe: [
    execArgs: "curl --fail --silent --output /dev/null http://localhost:4444/wd/hub/status",
    initialDelaySeconds: 30,
    periodSeconds: 5,
    timeoutSeconds: 15,
    failureThreshold: 6
  ]
] + devPods.hiRes()

def playwrightImg = [
  name: 'playwright',
  image: '103651136441.dkr.ecr.us-east-2.amazonaws.com/mirror/playwright:v1.52.0-noble'
] + devPods.hiRes()

def lfsCheckout = {
  tinyGit.addGitHubToKnownHosts()
  checkout localBranch(scm, [ lfs() ])
}

timestamps { notifyStatusChange(
  cleanupStep: { devPods.cleanUpPod(build: cacheName) },
  branches: ['main', 'release/7', 'release/8'],
  channel: '#tinymce-build-status',
  name: 'TinyMCE',
  mention: true
  ) {
  devPods.custom(
    containers: [
      nodeImg,
      seleniumImg,
      playwrightImg
    ],
    base: 'node'
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

    // Test here
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
        def name = "${os}-${platform.browser}${browserVersion}-${platform.provider}${suffix}"
        processes[name] = {
          grunt('list-changed-browser')
          runRemoteTests(name, platform.browser, platform.provider, platform.os, platform.version, s_bucket, s_buckets, runAllTests)
        }
      }
    }

    processes['headless'] = {
      grunt('list-changed-headless')
      runHeadlessTests(runAllTests)
    }

    processes['playwright'] = {
      exec('yarn -s --cwd modules/oxide-components test-ci')
      junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results.xml'
      def visualTestStatus = exec(script: 'yarn -s --cwd modules/oxide-components test-visual-ci', returnStatus: true)
      if (visualTestStatus == 4) {
        unstable("Visual tests failed")
      } else if (visualTestStatus != 0) {
        error("Unexpected error running visual tests")
      }
      junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results-visual.xml'
      exec('find modules/oxide-components -name "*.png" -type f || echo "No PNG files found"')
      archiveArtifacts artifacts: 'modules/oxide-components/test-results/**/*.png', allowEmptyArchive: true, fingerprint: true
    }

    stage('Tests') {
      bedrockRemoteTools.tinyWorkSishTunnel()
      parallel processes
    }

    stage('Deploy Storybook') {
      if (env.BRANCH_NAME == primaryBranch) {
        echo "Deploying Storybook"
        tinyGit.withGitHubSSHCredentials {
          exec('yarn -s --cwd modules/oxide-components deploy-storybook')
        }
      } else {
        echo "Skipping Storybook deployment as the pipeline is not running on the primary branch"
      }
    }
  }
}}
