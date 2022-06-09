import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as servicecatalog from "aws-cdk-lib/aws-servicecatalog";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs/lib/construct";

export interface CustomProps extends cdk.StackProps {
  project: string;
  stage: string;
}

export interface VpcStackProps extends cdk.StackProps {
  vpcCidr: string;
  envStr: string;
  pub_mask: number;
  pri_mask: number;
  db_mask: number;
}

export class VPCProduct extends servicecatalog.ProductStack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id);

    console.log(props);

    // 1. VPC
    this.vpc = new ec2.Vpc(this, "VPC", {
      vpcName: `${props.envStr}-vpc`,
      cidr: "10.0.0.0/18",
      natGatewayProvider:
        props.envStr !== "prod"
          ? ec2.NatProvider.instance({
              instanceType: new ec2.InstanceType("t2.micro"),
            })
          : undefined,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: props.envStr !== "prod" ? 1 : 2,
      maxAzs: 2,
      subnetConfiguration: [
        { name: "pub", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 28 },
        { name: "pri", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT, cidrMask: 24 },
        { name: "db", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 28 },
      ],
    });

    new ssm.StringParameter(this, "ParamVpcId", {
      description: `${props.envStr} VpcId`,
      parameterName: `/${props.envStr}/vpc/id`,
      stringValue: this.vpc.vpcId,
      tier: ssm.ParameterTier.STANDARD,
    });

    const S3Endpoint = this.vpc.addGatewayEndpoint("S3GatewayEndpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetGroupName: "pri" }],
    });

    S3Endpoint.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ["*"],
        actions: ["s3:*"],
        principals: [new iam.AnyPrincipal()],
      }),
    );

    // INFO: VPC Subnet Naming
    const subnetConfigs = [
      { name: "pub", subnetType: ec2.SubnetType.PUBLIC, cidrMask: props.pub_mask },
      { name: "pri", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT, cidrMask: props.pri_mask},
      { name: "db", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: props.db_mask },
    ];

    subnetConfigs.forEach((subnetConfig) => {
      let selectedSubnets = this.vpc.selectSubnets({
        subnetGroupName: subnetConfig.name,
      });

      selectedSubnets.subnets.forEach((value, index) => {
        cdk.Tags.of(value).add("Name", `${props.envStr}-${subnetConfig.name}-${String(index + 1).padStart(2, "0")}`);
      });
    });
  }

  get availabilityZones(): string[] {
    return ["ap-northeast-2a", "ap-northeast-2c"];
  }
}
