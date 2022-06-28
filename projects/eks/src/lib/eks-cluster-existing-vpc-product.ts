import * as path from 'path';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import * as cfn_inc from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';

//export class EksClusterProduct extends servicecatalog.ProductStack {
export class EksClusterExistingVPCProduct extends servicecatalog.ProductStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    //const vpcId = new cdk.CfnParameter(this, "VpcId", {
    /* new cdk.CfnParameter(this, 'VpcId', {
      type: 'AWS::EC2::VPC::Id',
      description: 'VPC ID for ECS Cluster',
    });

    //const priAId = new cdk.CfnParameter(this, "PrivateAId", {
    new cdk.CfnParameter(this, 'PrivateAId', {
      type: 'AWS::EC2::Subnet::Id',
      description: 'Private SubnetID A for ECS Cluster',
    });

    //const priBId = new cdk.CfnParameter(this, "PrivateBId", {
    new cdk.CfnParameter(this, 'PrivateBId', {
      type: 'AWS::EC2::Subnet::Id',
      description: 'Private SubnetID B for ECS Cluster',
    });

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-0c23c881612901d9f',
      //vpcId: vpcId.valueAsString,
      availabilityZones: ['ap-northeast-2a', 'ap-northeast-2c'],
      //privateSubnetIds: [priAId.valueAsString, priBId.valueAsString],
      privateSubnetIds: ['subnet-048d92ea6f7ed6bd2', 'subnet-063466d0934022f09'],
    });

    new eks.Cluster(this, 'HelloEKS', {
      version: eks.KubernetesVersion.V1_21,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }],
    }); */

    new cfn_inc.CfnInclude(this, 'eks-exsiting-vpc-product', {
      templateFile: path.join(__dirname, 'eks-cluster-existing-vpc.yml'),
    });
  }
}
