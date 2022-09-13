import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();

  await RequestContext.createAsync(orm.em, async () => {
    // const post = orm.em.create(Post, { title: "my first post" });
    // await orm.em.persistAndFlush(post);
    const post = await orm.em.find(Post, {});
    console.log(post);
  });
};

main().catch((err) => {
  console.log(err);
});
