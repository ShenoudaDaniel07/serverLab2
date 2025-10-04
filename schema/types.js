import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from "graphql";
import { fieldsList } from "graphql-fields-list";
import { companyLoader, usersByCompanyLoader } from "../loaders/loaders.js";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parent, args, context, info) {
        const fields = fieldsList(info);
        const selectionsField = {};
        fields.forEach((f) => {
          if (f === "company") selectionsField["companyId"] = 1;
          else selectionsField[f] = 1;
        });

        if (!parent.companyId) return null;
        return await context.companyLoader.load({
          id: parent.companyId,
          selectionsField,
        });
      },
    },
  }),
});

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slogan: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context) {
        return await context.usersByCompanyLoader.load(parent._id);
      },
    },
  }),
});
