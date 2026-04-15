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
  junit allowEmptyResults: true, testResults: "scratch/TEST-${name}.xml"

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
    " --bundler=rspack" +
    " --skipTypecheck" +
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

def nodeImg = devPods.getContainerDefaultArgs([
  name: 'node',
  image: "${ciRegistry}/build-containers/node-lts:lts",
  alwaysPullImage: true,
  runAsGroup: '1000',
  runAsUser: '1000'
]) + [
  // we can probably make this leaner if we condition primary vs branch
  // primary needs more io/mem/cpu to handle extra concurrent tests
  resourceRequestCpu: '8',
  resourceLimitCpu: '8',
  resourceRequestMemory: '10Gi',
  resourceLimitMemory: '10Gi'
] + devPods.highStorage()

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
] + [
  // lower resources than this and selenium has trouble staying up
  // selenium can go down to 500m/500Mi but crashes if things in the pod start leaking
  resourceRequestCpu: '600m',
  resourceLimitCpu: '600m',
  resourceRequestMemory: '600Mi',
  resourceLimitMemory: '600Mi'
] + devPods.lowStorage()

def playwrightImg = [
  name: 'playwright',
  // Use the mirrored image when possible
  // if there is no mirror only use mcr for testing and request a mirror
  image: 'mcr.microsoft.com/playwright:v1.58.2-noble',
//   image: '103651136441.dkr.ecr.us-east-2.amazonaws.com/mirror/playwright:v1.58.2-noble',
  command: 'sleep',
  args: 'infinity',
  alwaysPullImage: true
] + [
  resourceRequestCpu: '1',
  resourceLimitCpu: '2',
  resourceRequestMemory: '2Gi',
  resourceLimitMemory: '2Gi'
] + devPods.lowStorage()

timestamps { notifyStatusChange(
  cleanupStep: { devPods.cleanUpPod(build: cacheName) },
  branches: ['main', 'release/7', 'release/8'],
  channel: '#tinymce-build-status',
  name: 'TinyMCE',
  mention: true
  ) {
  // 90 min absolute ceiling for the whole pipeline; ensures notifyStatusChange
  // handles alerting even if a pod crash or unknown hang bypasses stage-level timeouts.
  // Set above the sum of inner stage timeouts (deps 5 + build 10 + tests 40 = 55 min + overhead)
  timeout(time: 90, unit: 'MINUTES') {
    // Retry on K8s pod scheduling failures; count: 2 = 1 original + 1 retry.
    // On retry, Deps + Build re-run (~4 min overhead) before tests resume.
    // handleNonKubernetes: true ensures the condition degrades gracefully on non-K8s agents.
    retry(conditions: [agent(), kubernetesAgent(handleNonKubernetes: true)], count: 2) {
      devPods.custom(
        containers: [
          nodeImg,
          seleniumImg,
          playwrightImg
        ],
        checkoutStep: {
          tinyGit.addGitHubToKnownHosts()
          checkout localBranch(scm, [ lfs() ])
        }
      ) {
      container("node") {

        // Setup git information
        tinyGit.addAuthorConfig()
        tinyGit.addGitHubToKnownHosts()

        props = readProperties(file: 'build.properties')
        String primaryBranch = props.primaryBranch
        assert primaryBranch != null && primaryBranch != ""


        stage('Deps') {
          // 5 min: bun install should never take this long; fail fast if it hangs
          // actual avg ~1 min, max observed ~2 min
          timeout(time: 5, unit: 'MINUTES') {
            // cancel build if primary branch doesn't merge cleanly
            gitMerge(primaryBranch)
            sh 'bun install'
          }
        }

        stage('Build') {
          // 10 min: full build + type-check; actual avg ~2 min, max observed ~7 min
          timeout(time: 10, unit: 'MINUTES') {
            // verify no errors in changelog merge
            exec("bun changie-merge")
            withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
              // type check and build TinyMCE
              exec("bun ci-all-seq")

              // validate documentation generator
              exec("bun tinymce-grunt shell:moxiedoc")
            }
          }
        }
      }

      def winChrome = [ browser: 'chrome', provider: 'aws', os: 'windows', buckets: 1 ]
      def winFirefox = [ browser: 'firefox', provider: 'lambdatest', os: 'windows', buckets: 1 ]
      def winEdge = [ browser: 'edge', provider: 'lambdatest', os: 'windows', buckets: 1 ]

      def macChrome = [ browser: 'chrome', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]
      def macFirefox = [ browser: 'firefox', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]
      def macSafari = [ browser: 'safari', provider: 'lambdatest', os: 'macOS Sequoia', buckets: 1 ]

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

      def stagger = 0
      for (int i = 0; i < platforms.size(); i++) {
        def platform = platforms.get(i)
        def buckets = platform.buckets ?: 1
        for (int bucket = 1; bucket <= buckets; bucket ++) {
          def suffix = buckets == 1 ? "" : "-" + bucket + "-" + buckets
          def os = String.valueOf(platform.os).startsWith('mac') ? 'Mac' : 'Win'
          def s_bucket = "${bucket}"
          def s_buckets = "${buckets}"
          def name = "${os}-${platform.browser}${platform.version ?: ''}-${platform.provider}${suffix}"
          def delaySeconds = stagger * 10
          stagger++
          processes[name] = {
            stage(name) {
              container('node') {
                // 35 min activity-based: resets on any log output; catches a single branch stalling
                // silently while other branches are still active (absolute outer Tests timeout won't
                // detect this). Must be set below the outer Tests timeout (40 min) to be reachable.
                timeout(time: 35, unit: 'MINUTES', activity: true) {
                  sleep( time: delaySeconds, unit: 'SECONDS')
                  grunt('list-changed-browser')
                  bedrockRemoteTools.withRemoteCreds(platform.provider) {
                    runRemoteTests(name, platform.browser, platform.provider, platform.os, platform.version, s_bucket, s_buckets, runAllTests)
                  }
                }
              }
            }
          }
        }
      }

      processes['headless'] = {
        stage('headless') {
          container('node') {
            // 5 min: headless Selenium tests average ~1 min, max observed ~1m10s
            timeout(time: 5, unit: 'MINUTES') {
              grunt('list-changed-headless')
              runHeadlessTests(runAllTests)
            }
          }
        }
      }

      processes['playwright'] = {
        stage('playwright') {
          container('playwright') {
            // 20 min: playwright unit + visual tests average ~8 min, max observed ~10m37s
            timeout(time: 20, unit: 'MINUTES') {
              // bun install (hoisted linker) produces an npm-compatible node_modules,
              // so we can run the scripts with the playwright image's existing npm
              // instead of installing bun in the container.
              sh 'npm run --prefix modules/oxide-components --silent test-ci'
              junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results.xml'
              def visualTestStatus
              // Limit the number of workers allowed to avoid hanging IO
              withEnv(["PW_WORKERS=1"]) {
                visualTestStatus = sh(script: 'npm run --prefix modules/oxide-components --silent test-visual-ci', returnStatus: true)
              }
              if (visualTestStatus == 4) {
                unstable("Visual tests failed")
              } else if (visualTestStatus != 0) {
                error("Unexpected error running visual tests")
              }
              junit allowEmptyResults: true, testResults: 'modules/oxide-components/scratch/test-results-visual.xml'
              exec('find modules/oxide-components -name "*.png" -type f || echo "No PNG files found"')
              archiveArtifacts artifacts: 'modules/oxide-components/test-results/**/*.png', allowEmptyArchive: true, fingerprint: true
            }
          }
        }
      }

      stage('Tests') {
        // 40 min: ceiling across all parallel branches; branches run concurrently so this only needs
        // to cover the slowest single branch. Max observed ~28 min (Mac-firefox/Win-edge); ~1.4x buffer.
        timeout(time: 40, unit: 'MINUTES') {
          // TODO: consider wrapping in try/finally to publish scratch/TEST-*.xml as a safety net
          // for results written before a timeout fires. Held back due to potential double-reporting
          // since runBedrockTest already publishes junit per test.
          container('node') {
            bedrockRemoteTools.tinyWorkSishTunnel()
          }
          parallel processes
        }
      }

      container('node') {

        stage('Deploy Storybook') {
          if (env.BRANCH_NAME == props.primaryBranch) {
            echo "Deploying Storybook"
            tinyGit.withGitHubSSHCredentials {
              exec('bun --silent --cwd modules/oxide-components deploy-storybook')
            }
          } else {
            echo "Skipping Storybook deployment as the pipeline is not running on the primary branch"
          }
        }
      } // close container
    } // close pod
    } // close retry
  } // close outer timeout
}} // close #notification and #timestamp
