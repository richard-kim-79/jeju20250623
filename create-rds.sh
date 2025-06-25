#!/bin/bash

# RDS PostgreSQL 인스턴스 생성 스크립트

# 기본 설정
DB_INSTANCE_IDENTIFIER="jeju-postgres-db"
DB_NAME="jeju_db"
DB_USERNAME="admin"
DB_PASSWORD="Jeju2025!"
DB_INSTANCE_CLASS="db.t3.micro"
DB_ENGINE="postgres"
DB_ENGINE_VERSION="15.3"
ALLOCATED_STORAGE=20

echo "AWS RDS PostgreSQL 인스턴스를 생성합니다..."

# 기본 VPC ID 가져오기
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
echo "VPC ID: $VPC_ID"

# 기본 서브넷 그룹 생성
SUBNET_GROUP_NAME="jeju-subnet-group"
aws rds create-db-subnet-group \
    --db-subnet-group-name $SUBNET_GROUP_NAME \
    --db-subnet-group-description "Jeju SNS Subnet Group" \
    --subnet-ids $(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[0:2].SubnetId' --output text) \
    --tags Key=Project,Value=Jeju

# 보안 그룹 생성
SECURITY_GROUP_NAME="jeju-rds-sg"
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "Jeju RDS Security Group" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# 보안 그룹 규칙 추가 (PostgreSQL 포트 5432)
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0

echo "보안 그룹 ID: $SECURITY_GROUP_ID"

# RDS 인스턴스 생성
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --db-instance-class $DB_INSTANCE_CLASS \
    --engine $DB_ENGINE \
    --engine-version $DB_ENGINE_VERSION \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage $ALLOCATED_STORAGE \
    --db-name $DB_NAME \
    --vpc-security-group-ids $SECURITY_GROUP_ID \
    --db-subnet-group-name $SUBNET_GROUP_NAME \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "sun:04:00-sun:05:00" \
    --storage-encrypted \
    --tags Key=Project,Value=Jeju

echo "RDS 인스턴스 생성이 시작되었습니다. 완료까지 약 5-10분 소요됩니다."
echo "생성된 인스턴스 정보:"
echo "  - 인스턴스 ID: $DB_INSTANCE_IDENTIFIER"
echo "  - 데이터베이스명: $DB_NAME"
echo "  - 사용자명: $DB_USERNAME"
echo "  - 비밀번호: $DB_PASSWORD" 