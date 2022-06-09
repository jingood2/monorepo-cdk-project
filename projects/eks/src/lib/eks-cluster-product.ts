import * as cdk from "aws-cdk-lib";
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as servicecatalog from "aws-cdk-lib/aws-servicecatalog";
import { Construct } from "constructs";

export class EksClusterProduct extends servicecatalog.ProductStack {
  constructor(scope: Construct, id: string ) {
    super(scope, id);

    const vpcId = new cdk.CfnParameter(this, "VpcId", {
      type: "AWS::EC2::VPC::Id",
      description: "VPC ID for ECS Cluster",
    });

    const vpc = ec2.Vpc.fromVpcAttributes(this, "Vpc", {
      vpcId: cdk.Lazy.string({ produce: () => vpcId.valueAsString }),
      availabilityZones: ["ap-northeast-2a", "ap-northeast-2c"],
    });

    new eks.Cluster(this, "HelloEKS", {
      version: eks.KubernetesVersion.V1_21,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }],
    });

  }
}
