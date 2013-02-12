#!/bin/bash
#
# Example script to be used as a post-update hook, triggered on a local repo
# to autodeploy dspace-client from a specific branch to a webserver docroot.
#


DEBUG=1
LOG='/var/log/deploy.log'

function log()
{
  if [[ ${DEBUG} == 1 ]]; then
    TS=$(date +'%Y-%m-%d %H:%M:%S %Z')
    echo "${TS} - $1" >> ${LOG}
  fi
}

### logfile safety ####################################################################

if [[ ! -f ${LOG} ]]; then
  touch ${LOG}
  if [[ $? != 0 ]]; then
    echo "Could not create logfile, please touch ${LOG} yourself."
  fi
fi

### check repository ##################################################################

if [[ $GL_REPO == "dspace-client" ]]; then

  # Local gitolite repo access, you can change it to any git repo you like
  GIT_REPO=$HOME/repositories/dspace-client.git

  ### develop branch actions ##########################################################

  if [[ $1 == "refs/heads/develop" ]]; then

    log "------------------------------------------------------------------------------"
    log "DSpace-Client (develop) push detected - running automated demo deploy now..." 

    TMP_GIT_CLONE=$HOME/tmp/dspace-client-develop
    PUBLIC_WWW=/var/www/dspace-develop.open-resource.org

    rm -rf $TMP_GIT_CLONE

    log "Cloning DSpace-Client (develop)... "
    git clone --recursive -b develop $GIT_REPO $TMP_GIT_CLONE >> ${LOG} 2>&1
    cd $TMP_GIT_CLONE

    log "Installing Node Modules... "
    /usr/bin/npm install --silent >> ${LOG} 2>&1

    log "Making Deps..."
    make deps >> ${LOG} 2>&1

    log "Building docs..."
    make doc >> ${LOG} 2>&1

    log "Building Client..."
    make build >> ${LOG} 2>&1

    log "Deploying Client... "
    rm -rf $PUBLIC_WWW/*
    cp -rfL $TMP_GIT_CLONE/build/* $PUBLIC_WWW/
    cp -rfL $TMP_GIT_CLONE/doc $PUBLIC_WWW/
    cp -rfL $TMP_GIT_CLONE/examples $PUBLIC_WWW/
    echo "<html><head><meta http-equiv='refresh' content='0; URL=http://dspace-develop.open-resource.org/doc/app/'></head><body></body></html>" > $PUBLIC_WWW/doc/index.html
    find $PUBLIC_WWW -type f -print0 | xargs -0 chmod 644
    find $PUBLIC_WWW -name "*.js" -print | xargs sed -i 's/localhost:3333/dspace-develop.open-resource.org/g'

    log "Flushing nginx cache... "
    sudo /usr/sbin/nginx -s reload

    log "DSpace-Client deploy completed - check http://dspace-develop.open-resource.org"
    log "------------------------------------------------------------------------------"

  fi
fi

exit  0
