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

export interface VpcStackProps {
  vpcCidr: string;
}

export class VPCProduct extends servicecatalog.ProductStack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id);

    
    const ENV = new cdk.CfnParameter(this, "Environment", {
      description: "Environment",
      type: "String",
      default: "dev",
      allowedValues: ["appliance", "dev", "shared", "prod"],
    });

    const PUB_CIDR_MASK = new cdk.CfnParameter(this, "PubCidrMask", {
      type: "Number",
      default: 28,
      description: "Public Subnet CIDR Block Mask for VPC. Must be /26 or larger CIDR block.",
      allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    const PRI_CIDR_MASK = new cdk.CfnParameter(this, "PriCidrMask", {
      type: "Number",
      default: 24,
      description: "Private Subnet CIDR Block Mask for VPC. Must be /21 or larger CIDR block.",
      allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    const DB_CIDR_MASK = new cdk.CfnParameter(this, "DBCidrMask", {
      type: "Number",
      default: 28,
      description: "DB Subnet CIDR Block Mask for VPC. Must be /28 or larger CIDR block.",
      allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    // 1. VPC
    this.vpc = new ec2.Vpc(this, "VPC", {
      vpcName: `${ENV.valueAsString}-vpc`,
      cidr: cdk.Lazy.string({ produce: () => props.vpcCidr }) ?? "10.0.0.0/18",
      natGatewayProvider:
        ENV.valueAsString !== "prod"
          ? ec2.NatProvider.instance({
              instanceType: new ec2.InstanceType("t2.micro"),
            })
          : undefined,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: ENV.valueAsString !== "prod" ? 1 : 2,
      maxAzs: 2,
      subnetConfiguration: [
        { name: "pub", subnetType: ec2.SubnetType.PUBLIC, cidrMask: PUB_CIDR_MASK.valueAsNumber },
        { name: "pri", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT, cidrMask: PRI_CIDR_MASK.valueAsNumber },
        { name: "db", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: DB_CIDR_MASK.valueAsNumber },
      ],
    });

    new ssm.StringParameter(this, "ParamVpcId", {
      description: `${ENV.valueAsString} VpcId`,
      parameterName: `/${ENV.valueAsString}/vpc/id`,
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
      { name: "pub", subnetType: ec2.SubnetType.PUBLIC, cidrMask: PUB_CIDR_MASK.valueAsNumber },
      { name: "pri", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT, cidrMask: PRI_CIDR_MASK.valueAsNumber },
      { name: "db", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: DB_CIDR_MASK.valueAsNumber },
    ];

    subnetConfigs.forEach((subnetConfig) => {
      let selectedSubnets = this.vpc.selectSubnets({
        subnetGroupName: subnetConfig.name,
      });

      selectedSubnets.subnets.forEach((value, index) => {
        cdk.Tags.of(value).add("Name", `${ENV.valueAsString}-${subnetConfig.name}-${String(index + 1).padStart(2, "0")}`);
      });
    });
  }

  get availabilityZones(): string[] {
    return ["ap-northeast-2a", "ap-northeast-2c"];
  }
}
