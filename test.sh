#!/bin/sh
#set -x

CTYP="Content-Type: application/x-www-form-urlencoded"
COMN="-f http://localhost:10801/"

curl -X PUT -H "${CTYP}" -d "adtk=sssss" -d "otpid=abcd" -d "value=hijk" ${COMN}
RET=$?
if [ ${RET} -ne 0 ]
then
  exit 1
fi
curl -X GET -H "${CTYP}" -d "action=randomdata" -d "otpid=abcd" ${COMN}
RET=$?
if [ ${RET} -ne 0 ]
then
  exit 2
fi
curl -X DELETE -H "${CTYP}" -d "adtk=sssss" -d "otpid=abcd" ${COMN}
RET=$?
if [ ${RET} -ne 0 ]
then
  exit 3
fi
