node("aws-tools") {
  def credentialsId = '8aa93893-84cc-45fc-a029-a42f21197bb3'

  stage("Primary: make directories") {
    sh "mkdir -p mobile-project"
    sh "mkdir -p jenkins-plumbing"
  }
  
  stage ("Primary: load shared pipelines") {
    dir("jenkins-plumbing") {
      git ([url: "ssh://git@stash:7999/van/jenkins-plumbing.git", credentialsId: credentialsId]) 
    }
    def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")
    def exec = load("jenkins-plumbing/exec.groovy")
  }
  
  dir("mobile-project") {    
    stage "Primary: checkout"
    git([branch: "TM-81", url:'ssh://git@stash:7999/tinymce/tinymce-mobile.git', credentialsId: credentialsId])
    
    echo "Fetching npm dependencies"
    sh "npm install"
    
    echo "Grunt"
    sh "grunt"
  }
  
  stage "Building local deployment"
  dir("mobile-project/src/themes/autochooser") {
      
      
      def version = readFile '../mobile/version.txt'
      echo version
      
      sh "grunt less standalone"
      
      sh "aws --profile staging s3 sync deploy-local s3://ephox-tinymce-mobile/versions/m" + version
  }
}