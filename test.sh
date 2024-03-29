#!/bin/sh
#set -x

COMN="-f http://localhost:10801/"
if [ -n "${TEST_URL}" ]
then
  COMN="-f ${TEST_URL}"
fi

ACT="randomtest"
if [ -n "${TEST_ACT}" ]
then
  ACT="${TEST_ACT}"
fi

CTYP="Content-Type: application/x-www-form-urlencoded"

curl -X PUT -H "${CTYP}" -d "action=${ACT}" -d "value=thisisatestdata" ${COMN}
RET=$?
if [ ${RET} -eq 0 ]
then
  echo ""
else
  exit 1
fi
curl -X GET -H "${CTYP}" -d "action=${ACT}" ${COMN}
RET=$?
if [ ${RET} -eq 0 ]
then
  echo ""
else
  exit 2
fi
curl -X DELETE -H "${CTYP}" -d "action=${ACT}" ${COMN}
RET=$?
if [ ${RET} -eq 0 ]
then
  echo ""
else
  exit 3
fi
