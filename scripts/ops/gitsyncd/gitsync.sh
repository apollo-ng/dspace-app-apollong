#!/bin/bash

GH_REPO="git://github.com/apollo-ng/dspace-client"
GL_REPO="git@localhost:dspace-client.git"
DEBUG=1
LOG='/home/gitsync/gitsyncd.log'

function log()
{
  if [[ ${DEBUG} == 1 ]]; then
    TS=$(date +'%Y-%m-%d %H:%M:%S %Z')
    echo "${TS} - $1" >> ${LOG}
  fi
}

case "$1" in

  "develop")
    TMP="/home/gitsync/tmp/dspace-client-develop"
    log "Cleaning Temporary Holding Space..."
    rm -rf ${TMP}
    log "Cloning Github Repo..."
    git clone -b develop ${GH_REPO} ${TMP} >> ${LOG} 2>&1
    cd ${TMP}
    git remote add mirror ${GL_REPO}
    log "Pushing to local repo"
    git push mirror develop  >> ${LOG} 2>&1
  ;;

  "master")
    TMP="/home/gitsync/tmp/dspace-client"
    log  "Cleaning Temporary Holding Space..."
    rm -rf ${TMP}
    log "Cloning Github Repo..."
    git clone -b master ${GH_REPO} ${TMP} >> ${LOG} 2>&1
    cd ${TMP}
    git remote add mirror ${GL_REPO}
    log "Pushing to local repo"
    #git push mirror master >> ${LOG} 2>&1
  ;;

  *)
    exit 0
  ;;

esac
exit 0
