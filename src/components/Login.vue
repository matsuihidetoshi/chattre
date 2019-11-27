<template>
  <div class="login">
    <amplify-authenticator></amplify-authenticator>
  </div>
</template>
<script>
export default {
  name: 'Login'
}
</script>
<style>
.login {
  margin: 20px;
}
@media screen and (max-width: 480px) {
  .login div {
    min-width: 0;
  }
}
</style>