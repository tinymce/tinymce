node("primary") {
  def credentialsId = '8aa93893-84cc-45fc-a029-a42f21197bb3'

  stage "Primary: make directories"
  sh "mkdir -p alloy-project"
  sh "mkdir -p jenkins-plumbing"

  stage "Primary: load shared pipelines"
  dir("jenkins-plumbing") {
     git ([url: "ssh://git@stash:7999/van/jenkins-plumbing.git", credentialsId: credentialsId]) 
  }
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")
   
  dir("alloy-project") {    
    stage "Primary: checkout"
    git([branch: "master", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: credentialsId])
    
    stage "Primary: dependencies"
    sh "dent"

    stage "Primary: atomic tests"
    sh "bolt test config/bolt/atomic.js \$(find src/test/js/atomic -name *.js)"
  }

  def permutations = [:]

  permutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome", sh: false ],
    [ name: "win10FF", os: "windows-10", browser: "firefox", sh: false ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge", sh: false ],
    [ name: "win10IE", os: "windows-10", browser: "ie", sh: false ]
  ]

  def processes = [:]

  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i);
    def name = permutation.name;
    processes[permutation.name] = {
      node("bedrock-" + permutation.os) {
        echo "Platform: checkout"
        git([branch: "master", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: credentialsId])
        
        echo "Platform: dependencies"
        if (permutation.sh) {
          sh "dent"
        } else {
          bat "dent"
        }  

        echo "Platform: browser tests for " + permutation.name
        extBedrock(permutation.name, permutation.browser, "src/test/js/browser src/test/js/webdriver", permutation.sh)
      }
    }
  }

  stage "Browser Tests"
  parallel processes

  stage "Publishing"
  dir("alloy-project") {
    sh "ent-ci -repo /ephox/repos/buildrepo2"
  }
}


