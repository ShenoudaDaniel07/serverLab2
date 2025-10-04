import DataLoader from "dataloader";
import { Company, User } from "../database/models.js";
import mongoose from "mongoose";

export const companyLoader = new DataLoader(async (data) => {
  const companyIds = data.map((item) => item.id);
  console.log("companyLoader batch ids:", companyIds);
  const validIds = companyIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const companies = await Company.find({ _id: { $in: validIds } }).select(
    data[0].selectionsField
  );
  console.log("companyLoader results:", companies);
  return companyIds.map((id) =>
    companies.find((c) => c._id.toString() === id.toString())
  );
});

export const usersByCompanyLoader = new DataLoader(async (companyIds) => {
  console.log("usersByCompanyLoader batch ids:", companyIds);
  const users = await User.find({ companyId: { $in: companyIds } });
  console.log("usersByCompanyLoader results:", users);
  return companyIds.map((id) =>
    users.filter((u) => u.companyId.toString() === id.toString())
  );
});
