import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLError,
} from "graphql";
import { UserType, CompanyType } from "./types.js";
import { User, Company } from "../database/models.js";
import { fieldsList } from "graphql-fields-list";

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(_parent, args, context, info) {
        const fields = fieldsList(info);
        const selections = {};
        fields.forEach((f) => {
          if (f === "company") selections["companyId"] = 1;
          else selections[f] = 1;
        });
        const user = await User.findById(args.id).select(selections);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);
        return user;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(_parent, _args, context, info) {
        const fields = fieldsList(info);
        const selections = {};
        fields.forEach((f) => {
          if (f === "company") selections["companyId"] = 1;
          else selections[f] = 1;
        });
        return await User.find().select(selections);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLID } },
      async resolve(_parent, args, context, info) {
        const company = await Company.findById(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);
        return company;
      },
    },
    companies: {
      type: new GraphQLList(CompanyType),
      async resolve() {
        return await Company.find();
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLID },
      },
      async resolve(_parent, args) {
        if (args.companyId) {
          const company = await Company.findById(args.companyId);
          if (!company) throw new GraphQLError("Company not found");
        }
        const user = await User.create(args);
        return user;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLID },
      },
      async resolve(_parent, args) {
        const user = await User.findById(args.id);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);

        if (args.companyId) {
          const company = await Company.findById(args.companyId);
          if (!company) throw new GraphQLError("Company not found");
        }

        const updatedUser = await User.findByIdAndUpdate(
          args.id,
          {
            firstName: args.firstName || user.firstName,
            age: args.age || user.age,
            companyId: args.companyId || user.companyId,
          },
          { new: true }
        );
        return updatedUser;
      },
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(_parent, args) {
        const user = await User.findByIdAndDelete(args.id);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);
        return user;
      },
    },
    createCompany: {
      type: CompanyType,
      args: {
        name: { type: GraphQLString },
        slogan: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        return await Company.create(args);
      },
    },
    updateCompany: {
      type: CompanyType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        slogan: { type: GraphQLString },
      },
      async resolve(_parent, args) {
        const company = await Company.findById(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);
        return await Company.findByIdAndUpdate(
          args.id,
          {
            name: args.name || company.name,
            slogan: args.slogan || company.slogan,
          },
          { new: true }
        );
      },
    },
    deleteCompany: {
      type: CompanyType,
      args: { id: { type: GraphQLID } },
      async resolve(_parent, args) {
        const company = await Company.findByIdAndDelete(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);
        return company;
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
