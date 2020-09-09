const {WaterfallDialog, ComponentDialog} = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt} = require('botbuilder-dialogs');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_PROMPT';

class FazerReservaDialog extends ComponentDialog {

    constructor() {
        super('fazerReservaDialog'); 

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.numeroPessoasValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            
        ]));

        this.iniciarReserva.bind(this), //Confirma se deseja reservar
        this.obterNome.bind(this), //Pedi nome do cliente
        this.obterNumeroPessoas.bind(this),  //Numero de pessoas
        this.obterData.bind(this), //Data da reserva
        this.obterHora.bind(this),  //Hora da reserva
        this.confirmarReserva.bind(this), //Exibe resumo das informacoes da reserva e solicita confirmacao
        this.resumoReserva.bind(this) //Exibe resumo das informacoes da reserva e solicita confirmacao

        this.initialDialogId = WATERFALL_DIALOG;

    }

    async run(turnContext, accessor) {

        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }

    }

    async iniciarReserva(step) {
        return await step.prompt(CONFIRM_PROMPT, 'Deseja realizar uma reserva?', ['Sim', 'Não']);
    }

    async obterNome(step) {
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'Qual o seu nome?');
        }
    }

    async obterNumeroPessoas(step) {
        step.values.nome = step.result;
        return await step.prompt(NUMBER_PROMPT, 'Qual o número de pessoas (1-50)?');
    }

    async obterData(step) {
        step.values.numeropessoas = step.result;
        return await step.prompt(DATETIME_PROMPT, 'Qual a data para a reserva?');
    }

    async obterHora(step) {
        step.values.data = step.result;
        return await step.prompt(DATETIME_PROMPT, 'Qual a hora para a reserva (18:00 - 23:00)?');
    }

    async confirmarReserva(step) {
        step.values.hora = step.result;

        var msg = `Verifique os dados da sua reserva:\n 
                    Nome: ${step.values.nome}\n
                    Pessoas: ${step.values.numeropessoas}\n
                    Data: ${step.values.data}\n
                    Hora: ${step.values.hora}\n`;

        await step.context.sendActivity(msg);
        
        return await step.prompt(CONFIRM_PROMPT, 'Confirma a reserva?', ['Sim', 'Não']);
    }

    async resumoReserva(step) {
        if (step.result === true) {
            await step.context.sendActivity('Reserva efetuada com sucesso. Seu código da reserva: 123');
            return await step.endDialog();
        }        
    }

    async numeroPessoasValidator(promptContext) {
        return promptContext.recognized.succeeded && promptContext.recognized.value >= 1 && promptContext.recognized.value <= 50;
    }

}

module.exports.FazerReservaDialog = FazerReservaDialog;