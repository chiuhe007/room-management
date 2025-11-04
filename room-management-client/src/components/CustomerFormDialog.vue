<!-- CustomerFormDialog.vue -->
<template>
    <el-dialog :model-value="modelValue" @update:modelValue="emit('update:modelValue', $event)"
        :title="initData.id ? '编辑客户' : '新增客户'" width="500px">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="身份证号" prop="idNumber">
                <el-input v-model="form.idNumber" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="emit('update:modelValue', false)">取消</el-button>
            <el-button type="primary" @click="submitForm">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { addCustomer } from '@/api/customer';

const props = defineProps({
    modelValue: Boolean,
    initData: Object
});
const emit = defineEmits(['update:modelValue', 'saved']);

const formRef = ref(null);
const form = reactive({
    name: '',
    phone: '',
    email: '',
    idNumber: ''
});

const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入有效邮箱', trigger: ['blur', 'change'] }],
    idNumber: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
};

watch(
    () => props.initData,
    (val) => {
        Object.assign(form, {
            name: val?.name || '',
            phone: val?.phone || '',
            email: val?.email || '',
            idNumber: val?.idNumber || ''
        });
    },
    { immediate: true }
);

const submitForm = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
            const res = await addCustomer(form);
            const customerId = res.data.id || res.data.insertId;
            ElMessage.success('客户添加成功');
            emit('update:modelValue', false); // 关闭弹窗
            emit('saved', customerId); // 通知父组件创建成功
        } catch (err) {
            console.error(err);
            ElMessage.error('添加客户失败');
        }
    });
};
</script>
